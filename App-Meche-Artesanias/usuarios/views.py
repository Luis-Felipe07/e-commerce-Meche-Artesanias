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
    
    
User = get_user_model()  # Asegúrate de tener un modelo personalizado si necesitas más campos

@api_view(['POST'])
def registrar_usuario_api(request):
    data = request.data
    errores = {}

    # Validaciones básicas
    nombre = data.get('nombre', '').strip()
    apellido = data.get('apellido', '').strip()
    tipo_documento = data.get('tipo_documento', '').strip()
    numero_documento = data.get('numero_documento', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not nombre:
        errores['nombre'] = 'El nombre es obligatorio.'

    if not apellido:
        errores['apellido'] = 'El apellido es obligatorio.'

    if not tipo_documento:
        errores['tipoDocumento'] = 'Debe seleccionar un tipo de documento.'

    if not numero_documento or len(numero_documento) < 6:
        errores['numeroDocumento'] = 'El número de documento es inválido.'

    try:
        validate_email(email)
    except ValidationError:
        errores['email'] = 'Correo electrónico no válido.'

    if User.objects.filter(email=email).exists():
        errores['email'] = 'Este correo ya está registrado.'

    if len(password) < 8:
        errores['password'] = 'La contraseña debe tener al menos 8 caracteres.'

    if errores:
        return Response({
            "mensaje": "Hay errores en el formulario.",
            "errores": errores
        }, status=status.HTTP_400_BAD_REQUEST)

    # Crear usuario
    user = User.objects.create_user(
        nombre=nombre,
        apellido=apellido,
        tipo_documento=tipo_documento,
        numero_documento=numero_documento,
        email=email,
        password=password  
    )
    

    return Response({
        "mensaje": "Registro exitoso. Redirigiendo al login...",
        "urlRedireccion": "index-login.html"
    }, status=status.HTTP_201_CREATED)