from django.core.management.base import BaseCommand
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.conf import settings
from apps.SGA.models import Exportacion

User = get_user_model()

class Command(BaseCommand):
    help = 'Envía alertas de vencimiento personalizadas del sistema SGA'

    def handle(self, *args, **options):
        try:
            hoy = timezone.now().date()
            limite = hoy + timezone.timedelta(days=3)
            
            vencimientos = Exportacion.objects.filter(
                vencimiento_preimposicion__lte=limite
            ).order_by('vencimiento_preimposicion')

            if not vencimientos.exists():
                self.stdout.write("No hay alertas críticas para enviar hoy.")
                return

            usuarios_activos = User.objects.filter(is_active=True)

            for usuario in usuarios_activos:
                if not usuario.email:
                    continue

                nombre_usuario = usuario.first_name if usuario.first_name else usuario.username
                saludo = f"Hola, {nombre_usuario}"

                filas_html = ""
                for exp in vencimientos:
                    color_alerta = "#dc2626" if exp.vencimiento_preimposicion <= hoy else "#ea580c"
                    vence_str = exp.vencimiento_preimposicion.strftime('%d/%m/%Y')
                    
                    filas_html += f"""
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 12px; font-weight: bold; color: #1e293b;">{exp.numero_destinacion}</td>
                        <td style="padding: 12px; color: #475569;">{exp.cliente.nombre if exp.cliente else 'Sin Cliente'}</td>
                        <td style="padding: 12px; color: #475569;">{exp.aduana.nombre if exp.aduana else 'N/A'}</td>
                        <td style="padding: 12px; text-align: right;">
                            <span style="color: {color_alerta}; font-weight: bold;">{vence_str}</span>
                        </td>
                    </tr>
                    """

                html_content = f"""
                <html>
                    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                            
                            <div style="background-color: #0f172a; padding: 30px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px; font-weight: 800;">SGA</h1>
                                <p style="color: #38bdf8; margin: 5px 0 0 0; font-size: 12px; text-transform: uppercase; font-weight: 600;">Sistema de Gestión Aduanera</p>
                            </div>
                            
                            <div style="padding: 30px;">
                                <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 15px;">{saludo},</h2>
                                <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                                    Se han detectado <strong>{vencimientos.count()}</strong> operaciones de exportación con vencimientos de preimposición próximos o vencidas que requieren tu atención inmediata:
                                </p>
                                
                                <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px;">
                                    <thead>
                                        <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                                            <th style="padding: 10px; text-align: left; color: #64748b;">Destinación</th>
                                            <th style="padding: 10px; text-align: left; color: #64748b;">Cliente</th>
                                            <th style="padding: 10px; text-align: left; color: #64748b;">Aduana</th>
                                            <th style="padding: 10px; text-align: right; color: #64748b;">Vencimiento</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filas_html}
                                    </tbody>
                                </table>
                                
                                <div style="margin-top: 35px; text-align: center;">
                                    <a href="http://localhost:5173" 
                                       style="background-color: #0284c7; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; font-size: 14px;">
                                       Abrir Panel de Control SGA
                                    </a>
                                </div>
                            </div>

                            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                                <p style="color: #64748b; font-size: 12px; margin: 0;">
                                    <strong>Desarrollado por Emmanuel Davezac</strong>
                                </p>
                                <p style="color: #94a3b8; font-size: 11px; margin-top: 5px;">
                                    Este es un reporte automático generado el {timezone.now().strftime('%d/%m/%Y a las %H:%M')}
                                </p>
                            </div>
                        </div>
                    </body>
                </html>
                """

                # Enviar correo individual para que el saludo sea correcto para cada uno
                subject = 'ALERTAS DE VENCIMIENTO - SGA'
                msg = EmailMultiAlternatives(subject, f'Hay {vencimientos.count()} vencimientos.', settings.DEFAULT_FROM_EMAIL, [usuario.email])
                msg.attach_alternative(html_content, "text/html")
                msg.send()

            self.stdout.write(self.style.SUCCESS(f"Reportes de SGA enviados correctamente."))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error en SGA: {str(e)}"))