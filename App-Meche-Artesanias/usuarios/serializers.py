# usuarios/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class RegistroUsuarioSerializer(serializers.ModelSerializer):
    # Valida y crea usuarios nuevos
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirmar_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['nombre', 'apellido', 'tipo_documento', 'numero_documento', 'email', 'password', 'confirmar_password']

    def validate(self, data):
        if data['password'] != data['confirmar_password']:
            raise serializers.ValidationError({"confirmarPassword": "Las contraseñas no coinciden"})
        if len(data['password']) < 8:
             raise serializers.ValidationError({"password": "La contraseña debe tener al menos 8 caracteres."})
        # Aquí podrías validar si el email ya existe, aunque la vista también lo hace
        # if User.objects.filter(email=data['email']).exists():
        #    raise serializers.ValidationError({"email": "Este correo ya está registrado."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirmar_password')
        user = User.objects.create_user(**validated_data)
        return user

# Serializer para ver/actualizar el perfil
class UserProfileSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField() # Para obtener la URL completa de la imagen

    class Meta:
        model = User
        fields = ['id', 'email', 'nombre', 'apellido', 'tipo_documento', 'numero_documento', 'biografia', 'avatar', 'avatar_url']
        read_only_fields = ['email', 'avatar', 'id'] # Campos que no se actualizan directamente aquí

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None

    # El método update ya está definido en ModelSerializer,
    # pero si necesitara lógica especial, la añadiría aquí.
    # def update(self, instance, validated_data):
    #     instance.nombre = validated_data.get('nombre', instance.nombre)
    #     # ... actualizar otros campos ...
    #     instance.save()
    #     return instance