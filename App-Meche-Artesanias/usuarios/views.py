

from django.contrib.auth import authenticate, get_user_model
# Importo lo necesario de DRF y JWT
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser # Para manejar archivos
from django.shortcuts import render


User = get_user_model()  # Obtengo mi modelo de usuario personalizado.

@api_view(['POST'])
def login_usuario(request):
    # Obtengo email y password de la petición
    email = request.data.get('email')
    password = request.data.get('password')

    # Intento autenticar al usuario
    user = authenticate(request, username=email, password=password)

    if user is not None:
        # Si la autenticación es exitosa, genero los tokens JWT
        refresh = RefreshToken.for_user(user)
        return Response({
            'mensaje': 'Inicio de sesion Exitoso',
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }, status=status.HTTP_200_OK)
        
    else:
        # Si falla, devuelvo un error 401
        return Response({'error': 'Credenciales Incorrectas'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def registrar_usuario_api(request):
    # Manejo el registro desde el frontend
    data = request.data
    errores = {}

    # Obtengo y limpio los datos
    nombre = data.get('nombre', '').strip()
    apellido = data.get('apellido', '').strip()
    tipo_documento = data.get('tipo_documento', '').strip()
    numero_documento = data.get('numero_documento', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')

    # Realizo validaciones básicas
    if not nombre: errores['nombre'] = 'El nombre es obligatorio.'
    if not apellido: errores['apellido'] = 'El apellido es obligatorio.'
    if not tipo_documento: errores['tipoDocumento'] = 'Debe seleccionar un tipo de documento.'
    if not numero_documento or len(numero_documento) < 6: errores['numeroDocumento'] = 'El número de documento es inválido.'
    try:
        validate_email(email)
    except ValidationError:
        errores['email'] = 'Correo electrónico no válido.'
    if User.objects.filter(email=email).exists(): errores['email'] = 'Este correo ya está registrado.'
    if len(password) < 8: errores['password'] = 'La contraseña debe tener al menos 8 caracteres.'

    # Si encuentro errores, los devuelvo
    if errores:
        return Response({
            "mensaje": "Hay errores en el formulario.",
            "errores": errores
        }, status=status.HTTP_400_BAD_REQUEST)

    # Si todo está bien, creo el usuario
    try:
        # Uso create_user para hashear la contraseña automáticamente
        user = User.objects.create_user(
            email=email,
            password=password,
            nombre=nombre,
            apellido=apellido,
            tipo_documento=tipo_documento,
            numero_documento=numero_documento
        )
    except Exception as e:
        print(f"Error al crear usuario: {e}") # Loggeo el error en consola
        return Response({"mensaje": "Ocurrió un error interno al registrar."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Devuelvo éxito
    return Response({"mensaje": "Registro exitoso. Redirigiendo al login..."}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verificar_autenticacion(request):
    # Verifico si el token JWT es válido y devuelvo datos básicos del usuario
    user = request.user
    # Genero la URL completa para la foto, o None si no existe
    avatar_url = request.build_absolute_uri(user.avatar.url) if user.avatar else None

    return Response({
        'mensaje': 'Usuario autenticado correctamente',
        'usuario': {
            'id': user.id,
            'email': user.email,
            'nombre': user.nombre,
            'apellido': user.apellido,
            'foto_perfil': avatar_url, # El frontend espera esta clave
            # Aquí podría añadir más datos si los necesito en el dashboard
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser]) # Necesario para manejar subida de archivos
def subir_foto_perfil_api(request):
    # Manejo la subida de la foto de perfil
    user = request.user
    # La clave 'foto_perfil' debe coincidir con la del FormData en JS
    archivo_foto = request.FILES.get('foto_perfil')

    if not archivo_foto:
        return Response({"success": False, "mensaje": "No se envió ningún archivo."}, status=status.HTTP_400_BAD_REQUEST)

    # Aquí podría añadir más validaciones (tamaño, tipo)
    if archivo_foto.size > 5 * 1024 * 1024: # Límite 5MB
        return Response({"success": False, "mensaje": "El archivo es demasiado grande (máx 5MB)."}, status=status.HTTP_400_BAD_REQUEST)
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if archivo_foto.content_type not in allowed_types:
        return Response({"success": False, "mensaje": "Tipo de archivo no válido."}, status=status.HTTP_400_BAD_REQUEST)

    # Guardo la foto en el campo 'avatar' del usuario
    user.avatar = archivo_foto
    user.save()

    # Devuelvo la URL de la nueva foto para que el frontend la muestre
    avatar_url = request.build_absolute_uri(user.avatar.url) if user.avatar else None
    return Response({
        "success": True,
        "mensaje": "Foto de perfil actualizada.",
        "url_foto": avatar_url # El frontend espera esta clave
    }, status=status.HTTP_200_OK)
    
 
 
def dashboard(request):
    return render(request, 'Tienda/dashboard.html') 

def login_form(request):
    return render(request, 'Tienda/login.html')

def registro_cliente(request):
    return render(request, 'Tienda/registro_cliente.html')

def nosotros(request):
    return render(request, 'Tienda/nosotros.html')

def contacto(request):
    return render(request, 'Tienda/contacto.html')