from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import date, timedelta
from django.http import FileResponse
from django.shortcuts import get_object_or_404
import os

from .models import Cliente, Archivo, Aduana, Importacion, Exportacion
from .serializers import (
    ClienteSerializer, 
    ArchivoSerializer, 
    AduanaSerializer, 
    ImportacionSerializer, 
    ExportacionSerializer
)


class ClienteViewSet(viewsets.ModelViewSet):
    # MAL: queryset = Cliente.objects.filter(baja=False) 
    # BIEN:
    queryset = Cliente.objects.all() 
    serializer_class = ClienteSerializer
    lookup_field = 'cuit'

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
        
        # Obtenemos los parámetros de la URL
        cliente_id = self.request.query_params.get('cliente')
        importacion_id = self.request.query_params.get('importacion')
        exportacion_id = self.request.query_params.get('exportacion')

        # Filtramos usando los nombres de campos que Django nos indicó en el error
        if cliente_id:
            # Según tu error, el campo es cuit_cliente
            queryset = queryset.filter(cuit_cliente_id=cliente_id)
            
        if importacion_id:
            # CAMBIO AQUÍ: Usamos id_importacion_id según el error
            queryset = queryset.filter(id_importacion_id=importacion_id)
            
        if exportacion_id:
            # CAMBIO AQUÍ: Usamos id_exportacion_id según el error
            queryset = queryset.filter(id_exportacion_id=exportacion_id)
            
        return queryset

    def perform_create(self, serializer):
        # Asocia automáticamente el usuario autenticado al subir el archivo
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

class ImportacionViewSet(viewsets.ModelViewSet):
    queryset = Importacion.objects.all()
    serializer_class = ImportacionSerializer

class ExportacionViewSet(viewsets.ModelViewSet):
    queryset = Exportacion.objects.all()
    serializer_class = ExportacionSerializer

    @action(detail=False, methods=['get'])
    def proximas_a_vencer(self, request):
        hoy = date.today()
        proxima_semana = hoy + timedelta(days=7)
        
        # Filtramos por el campo correcto de tu modelo
        alertas = Exportacion.objects.filter(
            vencimiento_preimposicion__range=[hoy, proxima_semana],
            baja=False
        )
        
        serializer = self.get_serializer(alertas, many=True)
        return Response(serializer.data)