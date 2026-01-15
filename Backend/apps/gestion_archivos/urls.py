from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ClienteViewSet, 
    ArchivoViewSet, 
    AduanaViewSet, 
    ImportacionViewSet, 
    ExportacionViewSet
)

# Creamos el router y registramos nuestros ViewSets
# El router se encarga de generar automáticamente las URLs como:
# /api/clientes/
# /api/documentos/
# /api/aduanas/
# etc.
router = DefaultRouter()
router.register(r'clientes', ClienteViewSet, basename='cliente')
router.register(r'documentos', ArchivoViewSet, basename='archivo')
router.register(r'aduanas', AduanaViewSet, basename='aduana')
router.register(r'importaciones', ImportacionViewSet, basename='importacion')
router.register(r'exportaciones', ExportacionViewSet, basename='exportacion')

# Las URLs de la aplicación
urlpatterns = [
    # Incluimos todas las rutas generadas por el router
    path('', include(router.urls)),
]