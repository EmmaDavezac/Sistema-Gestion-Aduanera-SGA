from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
# EL CAMBIO ESTÁ AQUÍ: Quitamos los ".."
from apps.SGA.views import MyTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    # Rutas de Autenticación con tu lógica de is_staff
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Rutas de la App
    path('api/', include('apps.SGA.urls')),
]

# Si necesitas servir archivos locales (PDFs, imágenes) en desarrollo:
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)