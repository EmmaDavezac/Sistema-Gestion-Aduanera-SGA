from rest_framework import viewsets, status
from rest_framework.decorators import action,api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .permissions import SoloAdminBajaAlta, SoloAdmin, SoloAdminEscritura
from datetime import date, timedelta
from django.http import FileResponse
from django.shortcuts import get_object_or_404
import os
from django.contrib.auth.models import User

from .models import Cliente, Archivo, Aduana, Importacion, Exportacion
from .serializers import (
    ClienteSerializer, 
    ArchivoSerializer, 
    AduanaSerializer, 
    ImportacionSerializer, 
    ExportacionSerializer,
    UserSerializer
)
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from rest_framework.response import Response

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [SoloAdmin]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all() 
    serializer_class = ClienteSerializer
    lookup_field = 'cuit'
    permission_classes = [IsAuthenticated, SoloAdminBajaAlta] 
    
    def partial_update(self, request, *args, **kwargs):
        if 'baja' in request.data and request.data['baja'] == True:
            cliente = self.get_object()
            
            tiene_importaciones = Importacion.objects.filter(
                cliente=cliente,
                baja=False
            ).exists()
            
            tiene_exportaciones = Exportacion.objects.filter(
                cliente=cliente,
                baja=False
            ).exists()
            
            if tiene_importaciones or tiene_exportaciones:
                return Response(
                    {"error": "No se puede dar de baja al cliente porque tiene operaciones activas."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def todos(self, request):
        """Incluye incluso los clientes con baja=True si fuera necesario."""
        clientes = Cliente.objects.all()
        serializer = self.get_serializer(clientes, many=True)
        return Response(serializer.data)

class ArchivoViewSet(viewsets.ModelViewSet):
    """
    Maneja la lógica de archivos vinculados a Clientes, Impo o Expo.
    """
    queryset = Archivo.objects.all()
    serializer_class = ArchivoSerializer
    permission_classes = [IsAuthenticated]


    def get_queryset(self):
        queryset = Archivo.objects.all()
        
        cliente_id = self.request.query_params.get('cliente')
        importacion_id = self.request.query_params.get('importacion')
        exportacion_id = self.request.query_params.get('exportacion')

        if cliente_id:
            queryset = queryset.filter(cuit_cliente_id=cliente_id)
            
        if importacion_id:
            queryset = queryset.filter(id_importacion_id=importacion_id)
            
        if exportacion_id:
            queryset = queryset.filter(id_exportacion_id=exportacion_id)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'])
    def descargar(self, request, pk=None):
        """
        Endpoint para descargar el archivo físico.
        URL: /api/documentos/{id}/descargar/
        """
        archivo_obj = get_object_or_404(Archivo, pk=pk)
        ruta_archivo = archivo_obj.archivo.path
        
        if os.path.exists(ruta_archivo):
            return FileResponse(
                open(ruta_archivo, 'rb'), 
                as_attachment=True, 
                filename=archivo_obj.nombre
            )
        return Response(
            {"error": "El archivo físico no se encuentra en el servidor"}, 
            status=status.HTTP_404_NOT_FOUND
        )
  
class AduanaViewSet(viewsets.ModelViewSet):
    queryset = Aduana.objects.all()
    serializer_class = AduanaSerializer
    permission_classes = [IsAuthenticated, SoloAdminEscritura]

class ImportacionViewSet(viewsets.ModelViewSet):
    queryset = Importacion.objects.all()
    serializer_class = ImportacionSerializer
    permission_classes = [IsAuthenticated, SoloAdminBajaAlta]

class ExportacionViewSet(viewsets.ModelViewSet):
    queryset = Exportacion.objects.all()
    serializer_class = ExportacionSerializer
    permission_classes = [IsAuthenticated, SoloAdminBajaAlta]

    @action(detail=False, methods=['get'])
    def proximas_a_vencer(self, request):
        hoy = date.today()
        proxima_semana = hoy + timedelta(days=7)
        
        alertas = Exportacion.objects.filter(
            vencimiento_preimposicion__lte=proxima_semana,
            baja=False,
            oficializacion__isnull=True
        ).order_by('vencimiento_preimposicion')
        
        serializer = self.get_serializer(alertas, many=True)
        return Response(serializer.data)

    

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['is_staff'] = user.is_staff
        token['username'] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        data['isAdmin'] = self.user.is_staff
        return data

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        captcha_key = request.data.get('captcha_key')
        captcha_value = request.data.get('captcha_value')

        if not captcha_key or not captcha_value:
            return Response({"error": "Debe completar el captcha"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            captcha = CaptchaStore.objects.get(hashkey=captcha_key)
            if captcha.response != captcha_value.lower():
                return Response({"error": "Código de verificación incorrecto"}, status=status.HTTP_400_BAD_REQUEST)
            
            captcha.delete()
        except CaptchaStore.DoesNotExist:
            return Response({"error": "El captcha ha expirado o es inválido"}, status=status.HTTP_400_BAD_REQUEST)

        return super().post(request, *args, **kwargs)
    
@api_view(['GET'])
@permission_classes([AllowAny])
def get_new_captcha(request):
    new_key = CaptchaStore.generate_key()
    image_url = captcha_image_url(new_key)
    full_url = request.build_absolute_uri(image_url)
    return Response({
        'key': new_key,
        'image_url': full_url
    })
User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def solicitar_reset(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email requerido'}, status=400)
    
    try:
        user = User.objects.get(email=email, is_active=True)
    except User.DoesNotExist:
        # Por seguridad respondemos ok igual
        return Response({'ok': True})
    
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 30px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background: #0f172a; padding: 25px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px; letter-spacing: 2px;">SGA</h1>
          <p style="color: #38bdf8; margin: 5px 0 0; font-size: 11px; text-transform: uppercase;">Restablecimiento de Contraseña</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1e293b;">Hola, {user.first_name or user.username}</h2>
          <p style="color: #475569; line-height: 1.6;">Recibimos una solicitud para restablecer tu contraseña. Hacé clic en el botón para continuar:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{link}" style="background: #0284c7; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px;">Este link expira en 1 hora. Si no solicitaste esto, ignorá este email.</p>
        </div>
        <div style="background: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 11px; margin: 0;">Sistema de Gestión Aduanera · SGA</p>
        </div>
      </div>
    </body>
    </html>
    """

    msg = EmailMultiAlternatives(
        'Restablecer contraseña — SGA',
        f'Restablecé tu contraseña: {link}',
        settings.DEFAULT_FROM_EMAIL,
        [user.email]
    )
    msg.attach_alternative(html, "text/html")
    msg.send()

    return Response({'ok': True})


@api_view(['POST'])
@permission_classes([AllowAny])
def confirmar_reset(request):
    uid = request.data.get('uid')
    token = request.data.get('token')
    password = request.data.get('password')

    if not all([uid, token, password]):
        return Response({'error': 'Datos incompletos'}, status=400)

    try:
        pk = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=pk)
    except Exception:
        return Response({'error': 'Link inválido'}, status=400)

    if not default_token_generator.check_token(user, token):
        return Response({'error': 'Link expirado o inválido'}, status=400)

    if len(password) < 8:
        return Response({'error': 'La contraseña debe tener al menos 8 caracteres'}, status=400)

    user.set_password(password)
    user.save()
    return Response({'ok': True})
