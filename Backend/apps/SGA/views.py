from rest_framework import viewsets, status
from rest_framework.decorators import action,api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

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
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all() 
    serializer_class = ClienteSerializer
    lookup_field = 'cuit'
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

class ImportacionViewSet(viewsets.ModelViewSet):
    queryset = Importacion.objects.all()
    serializer_class = ImportacionSerializer
    permission_classes = [IsAuthenticated]

class ExportacionViewSet(viewsets.ModelViewSet):
    queryset = Exportacion.objects.all()
    serializer_class = ExportacionSerializer
    permission_classes = [IsAuthenticated]

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