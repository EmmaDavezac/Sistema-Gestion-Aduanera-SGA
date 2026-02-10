from rest_framework import serializers
from .models import Cliente, Archivo, Aduana, Importacion, Exportacion
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    # Declaramos el campo manualmente para quitarle la obligatoriedad
    password = serializers.CharField(
        write_only=True, 
        required=False, 
        allow_blank=True, 
        allow_null=True
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name','last_name', 'email', 'password', 'is_staff', 'is_active']

    def create(self, validated_data):
        # Django encripta la contraseña automáticamente con create_user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', '')
        )
        return user
    
    def update(self, instance, validated_data):
            # 1. Sacamos la contraseña del paquete de datos
            password = validated_data.pop('password', None)
            
            # 2. Actualizamos los demás campos (nombre, email, etc.)
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            # 3. ¡ESTO ES LO MÁS IMPORTANTE!
            # Si hay una nueva contraseña, usamos set_password para encriptarla
            if password and password.strip():
                instance.set_password(password) # <--- Aquí ocurre la magia
                
            instance.save()
            return instance

class AduanaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aduana
        fields = '__all__'

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['cuit', 'nombre', 'domicilio', 'telefono_1', 'observaciones', 'baja']

class ImportacionSerializer(serializers.ModelSerializer):
    # Esto permite ver el nombre del cliente y aduana en lugar de solo el ID al consultar
    cliente_nombre = serializers.ReadOnlyField(source='cliente.nombre')
    aduana_nombre = serializers.ReadOnlyField(source='aduana.nombre')

    class Meta:
        model = Importacion
        fields = '__all__'

class ExportacionSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.ReadOnlyField(source='cliente.nombre')
    aduana_nombre = serializers.ReadOnlyField(source='aduana.nombre')
    class Meta:
        model = Exportacion
        fields = '__all__'

class ArchivoSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    nombre_cliente = serializers.ReadOnlyField(source='cuit_cliente.nombre')
    
    class Meta:
        model = Archivo
        fields = [
            'id', 'nombre', 'archivo', 'tipo', 'tipo_display', 
            'cuit_cliente', 'nombre_cliente', 'id_importacion', 
            'id_exportacion', 'user', 'fecha_subida'
        ]
        read_only_fields = ('user', 'fecha_subida')

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Añadimos el campo is_staff al token
        token['is_staff'] = user.is_staff
        token['username'] = user.username
        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer