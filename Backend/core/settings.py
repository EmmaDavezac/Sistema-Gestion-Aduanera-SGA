import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
#Se obtiene la clave secreta y otras configuraciones sensibles desde variables de entorno para mayor seguridad. Si no se encuentra la clave, se lanza un error para evitar que la aplicación se ejecute sin una configuración adecuada.
SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError("SECRET_KEY no está definida en las variables de entorno")
#La configuración de DEBUG también se obtiene de una variable de entorno, permitiendo activar o desactivar el modo de depuración sin modificar el código. Por defecto, se asume que DEBUG es True si no se especifica lo contrario.
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
#ALLOWED_HOSTS se configura a través de una variable de entorno, permitiendo especificar múltiples hosts separados por comas. Si no se proporciona esta variable, se asume 'localhost' como valor predeterminado.
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost').split(',')
CORS_ALLOW_CREDENTIALS = True
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
    'apps.SGA',
    'captcha'
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'
DATABASES = {
    'default': {
        'ENGINE': os.environ.get('DB_ENGINE') or 'django.db.backends.sqlite3',
        'NAME': os.environ.get('DB_NAME') or os.path.join(BASE_DIR, 'db.sqlite3'),
        'USER': os.environ.get('DB_USER') or '',
        'PASSWORD': os.environ.get('DB_PASSWORD') or '',
        'HOST': os.environ.get('DB_HOST') or '',
        'PORT': os.environ.get('DB_PORT') or '',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', },
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },
]

LANGUAGE_CODE = 'es-es'
TIME_ZONE = 'America/Argentina/Buenos_Aires'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


CORS_ALLOW_ALL_ORIGINS = os.environ.get('CORS_ALLOW_ALL_ORIGINS', 'False').lower() == 'true'

CORS_EXPOSE_HEADERS = [*
    'Content-Disposition',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=10),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}
# Configuración para manejo de archivos multimedia (imágenes de perfil, documentos, etc.)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
# Configuración de correo electrónico para restablecimiento de contraseña y notificaciones
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = f"SGA - Sistema de Gestión Aduanera <{EMAIL_HOST_USER}>"
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

# Configuración de CAPTCHA
CAPTCHA_CHALLENGE_FUNCT = 'captcha.helpers.math_challenge'
CAPTCHA_IMAGE_SIZE = (120, 45)
CAPTCHA_FONT_SIZE = 30
CAPTCHA_TIMEOUT = 10
CAPTCHA_NOISE_FUNCTIONS = []
CAPTCHA_LETTER_ROTATION = (-5, 5)

#Tiempo de expiración para el token de restablecimiento de contraseña (en segundos)
PASSWORD_RESET_TIMEOUT = 3600  # 1 hora