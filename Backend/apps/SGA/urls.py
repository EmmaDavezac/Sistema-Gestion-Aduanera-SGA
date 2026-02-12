from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    MyTokenObtainPairView,
    ClienteViewSet,
    ArchivoViewSet,
    AduanaViewSet,
    ImportacionViewSet,
    ExportacionViewSet,
    UserViewSet,
    get_new_captcha
)

router = DefaultRouter()
router.register(r'clientes', ClienteViewSet, basename='cliente')
router.register(r'documentos', ArchivoViewSet, basename='archivo')
router.register(r'aduanas', AduanaViewSet, basename='aduana')
router.register(r'importaciones', ImportacionViewSet, basename='importacion')
router.register(r'exportaciones', ExportacionViewSet, basename='exportacion')
router.register(r'usuarios', UserViewSet, basename='usuario')


urlpatterns = [
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('get-captcha/', get_new_captcha, name='get_captcha'),
    path('', include(router.urls)),
]
