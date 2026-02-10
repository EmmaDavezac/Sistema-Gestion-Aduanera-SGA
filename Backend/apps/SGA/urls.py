from django.urls import path, include
from rest_framework.routers import DefaultRouter
# Importamos tus vistas personalizadas y las de JWT
from .views import (
    MyTokenObtainPairView, 
    ClienteViewSet, 
    ArchivoViewSet, 
    AduanaViewSet, 
    ImportacionViewSet, 
    ExportacionViewSet,
    UserViewSet
)
from rest_framework_simplejwt.views import TokenRefreshView

# 1. Configuración del Router para los ViewSets (CRUDs)
router = DefaultRouter()
router.register(r'clientes', ClienteViewSet, basename='cliente')
router.register(r'documentos', ArchivoViewSet, basename='archivo')
router.register(r'aduanas', AduanaViewSet, basename='aduana')
router.register(r'importaciones', ImportacionViewSet, basename='importacion')
router.register(r'exportaciones', ExportacionViewSet, basename='exportacion')
router.register(r'usuarios', UserViewSet, basename='usuario')

# 2. Definición de URLs
urlpatterns = [
    # Rutas de Autenticación (Las que usará tu auth.js en React)
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Rutas del API (CRUDs automáticos)
    path('', include(router.urls)),
]