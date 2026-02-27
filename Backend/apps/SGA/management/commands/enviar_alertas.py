from django.core.management.base import BaseCommand
from django.core.mail import EmailMultiAlternatives, get_connection
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.conf import settings
from apps.SGA.models import Exportacion

User = get_user_model()

class Command(BaseCommand):
    help = 'Envía alertas de exportaciones vencidas o por vencer (sin oficializar) del sistema SGA'

    def handle(self, *args, **options):
        try:
            hoy = timezone.now().date()
            limite_proximo = hoy + timezone.timedelta(days=5)
            
            vencimientos = Exportacion.objects.filter(
                vencimiento_preimposicion__lte=limite_proximo,
                oficializacion__isnull=True,
                baja=False
            ).select_related('cliente', 'aduana').order_by('vencimiento_preimposicion')

            if not vencimientos.exists():
                self.stdout.write(self.style.SUCCESS("No hay alertas críticas para enviar hoy (sin oficialización)."))
                return

            usuarios_activos = User.objects.filter(is_active=True).exclude(email='')

            if not usuarios_activos.exists():
                self.stdout.write(self.style.WARNING("No hay usuarios activos con correo configurado."))
                return

            connection = get_connection()
            connection.open()
            mensajes_a_enviar = []

            self.stdout.write(f"Procesando {vencimientos.count()} alertas para {usuarios_activos.count()} usuarios...")

            for usuario in usuarios_activos:
                nombre_usuario = usuario.first_name if usuario.first_name else usuario.username
                saludo = f"Hola, {nombre_usuario}"

                filas_html = ""
                for exp in vencimientos:
                    es_vencida = exp.vencimiento_preimposicion < hoy
                    
                    bg_color = "#fff1f2" if es_vencida else "transparent"
                    color_texto_vence = "#b91c1c" if es_vencida else "#ea580c"
                    etiqueta = "¡VENCIDA!" if es_vencida else "Por Vencer"
                    vence_str = exp.vencimiento_preimposicion.strftime('%d/%m/%Y')
                    
                    filas_html += f"""
                    <tr style="border-bottom: 1px solid #e2e8f0; background-color: {bg_color};">
                        <td style="padding: 12px; font-weight: bold; color: #1e293b;">{exp.numero_destinacion}</td>
                        <td style="padding: 12px; color: #475569;">{exp.cliente.nombre if exp.cliente else 'Sin Cliente'}</td>
                        <td style="padding: 12px; color: #475569;">{exp.aduana.nombre if exp.aduana else 'N/A'}</td>
                        <td style="padding: 12px; text-align: right;">
                            <span style="color: {color_texto_vence}; font-weight: 800; font-size: 10px; display: block; margin-bottom: 2px;">{etiqueta}</span>
                            <span style="color: #1e293b; font-weight: bold;">{vence_str}</span>
                        </td>
                    </tr>
                    """

                html_content = f"""
                <html>
                    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: Arial, sans-serif;">
                        <div style="max-width: 650px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <div style="background-color: #0f172a; padding: 25px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 2px;">SGA</h1>
                                <p style="color: #38bdf8; margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase;">Alerta de Vencimientos Críticos</p>
                            </div>
                            
                            <div style="padding: 30px;">
                                <h2 style="color: #1e293b; font-size: 18px;">{saludo},</h2>
                                <p style="color: #475569; font-size: 14px; line-height: 1.5;">
                                    Se han detectado exportaciones que requieren atención inmediata. Estas operaciones <strong>no han sido oficializadas</strong> y su fecha de preimposición está próxima o ya ha expirado:
                                </p>
                                
                                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                                    <thead>
                                        <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                                            <th style="padding: 10px; text-align: left; color: #64748b; font-size: 12px;">Destinación</th>
                                            <th style="padding: 10px; text-align: left; color: #64748b; font-size: 12px;">Cliente</th>
                                            <th style="padding: 10px; text-align: left; color: #64748b; font-size: 12px;">Aduana</th>
                                            <th style="padding: 10px; text-align: right; color: #64748b; font-size: 12px;">Vencimiento</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filas_html}
                                    </tbody>
                                </table>
                                
                                <div style="margin-top: 30px; text-align: center;">
                                    <a href="http://localhost:5173" 
                                       style="background-color: #0284c7; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
                                        Ir al Sistema de Gestión
                                    </a>
                                </div>
                            </div>

                            <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;">
                                <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                                    Generado automáticamente el {timezone.now().strftime('%d/%m/%Y %H:%M')}
                                </p>
                            </div>
                        </div>
                    </body>
                </html>
                """

                subject = 'ALERTA: Vencimientos sin Oficializar - SGA'
                text_content = f"Hola, hay {vencimientos.count()} exportaciones por vencer o vencidas sin oficializar."
                
                msg = EmailMultiAlternatives(
                    subject, 
                    text_content, 
                    settings.DEFAULT_FROM_EMAIL, 
                    [usuario.email],
                    connection=connection
                )
                msg.attach_alternative(html_content, "text/html")
                mensajes_a_enviar.append(msg)

            connection.send_messages(mensajes_a_enviar)
            connection.close()

            self.stdout.write(self.style.SUCCESS(f"Éxito: Se enviaron {len(mensajes_a_enviar)} correos de alerta."))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error crítico en el comando: {str(e)}"))