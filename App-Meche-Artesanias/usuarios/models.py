# usuarios/models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("El correo electrónico es obligatorio")
        email = self.normalize_email(email)
        extra_fields.setdefault('username', email)  # Evitar problemas con username requerido
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class UsuarioPersonalizado(AbstractUser):
    nombre = models.CharField(max_length=50, null=True)
    apellido = models.CharField(max_length=50, null=True)
    tipo_documento = models.CharField(max_length=20, null=True)
    numero_documento = models.CharField(max_length=20, null=True)
    email = models.EmailField(unique=True)
    biografia = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    # Usando el manager personalizado
    objects = UsuarioManager()

    USERNAME_FIELD = 'email' 
    REQUIRED_FIELDS = ['nombre', 'apellido', 'tipo_documento', 'numero_documento']

    def __str__(self):
        return self.email

