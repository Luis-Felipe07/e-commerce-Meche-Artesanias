from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from usuarios.serializers import RegistroUsuarioSerializer
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model


@api_view(['POST'])
def login_usuario(request):
    username = request.data.get('usuario')
    password = request.data.get('clave')
    
    user = authenticate(request, username=username, password=password)
    
    
    if user is not None:
        return Response({'mensaje': 'Inicio de sesion Exitoso'}, status=status.HTTP_200_OK)
    
    else:
        return Response({'error': 'Credenciales Incorrectas'}, status=status.HTTP_401_UNAUTHORIZED)
    