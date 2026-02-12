from rest_framework import serializers
from .models import Cliente, Archivo, Aduana, Importacion, Exportacion
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class UserSerializer(serializers.ModelSerializer):
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
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', '')
        )
        return user
    
    def update(self, instance, validated_data):
            password = validated_data.pop('password', None)
            
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            if password and password.strip():
                instance.set_password(password) 
                
            instance.save()
            return instance

class AduanaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aduana
        fields = '__all__'

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = [
            'cuit', 'nombre', 'domicilio', 'telefono_1', 
            'telefono_2', 'fecha_inicio_actividad', 'observaciones', 'baja'
        ]
        extra_kwargs = {
            'cuit': {'read_only': False, 'required': False}
        }
class ImportacionSerializer(serializers.ModelSerializer):
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

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['is_staff'] = user.is_staff
        token['username'] = user.username
        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer