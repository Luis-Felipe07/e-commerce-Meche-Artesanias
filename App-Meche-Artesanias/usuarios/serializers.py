from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class RegistroUsuarioSerializer(serializers.ModelSerializer):
    confirmar_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['nombre', 'apellido', 'tipo_documento', 'numero_documento', 'email', 'password', 'confirmar_password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        if data['password'] != data['confirmar_password']:
            raise serializers.ValidationError({"confirmarPassword": "Las contraseñas no coinciden"})
        return data

    def create(self, validated_data):
        validated_data.pop('confirmar_password')
        return User.objects.create_user(**validated_data)
