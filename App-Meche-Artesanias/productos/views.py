# App-Meche-Artesanias/productos/views.py
from django.shortcuts import render, redirect, get_object_or_404
from .models import Categoria, Producto, MetodoPago, Carrito, CarritoItem, Pedido, DetallePedido
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import CarritoSerializer # Asegúrate que CarritoSerializer importa todo lo necesario
from django.contrib.auth.decorators import login_required  # noqa: F401

# Vista para la página de la tienda
def tienda(request):
    categorias = Categoria.objects.all()
    productos = Producto.objects.select_related('categoria').filter(disponible=True)
    metodos_pago = MetodoPago.objects.all()
    context = {
        'categorias': categorias,
        'productos': productos,
        'metodos_pago': metodos_pago,
    }
    return render(request, 'Tienda/tienda.html', context)

# --- Vistas de API para el Carrito ---

class CarritoView(APIView):
    """ API para obtener/crear el carrito del usuario autenticado. """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        carrito, creado = Carrito.objects.get_or_create(usuario=request.user)
        # Paso el contexto request para que las URLs de imágenes se generen correctamente
        serializer = CarritoSerializer(carrito, context={'request': request})
        return Response(serializer.data)

class AgregarItemCarrito(APIView):
    """ API para agregar un item al carrito. """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        producto_id = request.data.get('producto_id')
        cantidad = max(1, int(request.data.get('cantidad', 1))) # Asegura cantidad >= 1

        if not producto_id:
            return Response({"error": "ID de producto requerido"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            producto = get_object_or_404(Producto, id=producto_id, disponible=True)
            carrito, _ = Carrito.objects.get_or_create(usuario=request.user)
            item, creado = CarritoItem.objects.get_or_create(
                carrito=carrito,
                producto=producto,
                defaults={'cantidad': 0} # Mejor inicializar en 0 y luego sumar
            )

            # Verifico stock ANTES de intentar añadir la nueva cantidad
            cantidad_actual_en_carrito = item.cantidad
            stock_disponible = producto.stock

            if stock_disponible == 0:
                 return Response({"error": f"Lo sentimos, '{producto.nombre}' está agotado."}, status=status.HTTP_400_BAD_REQUEST)

            # Calculo cuánto realmente puedo añadir
            cantidad_maxima_a_anadir = stock_disponible - cantidad_actual_en_carrito

            if cantidad > cantidad_maxima_a_anadir:
                 # Si piden más de lo que puedo añadir
                 if cantidad_maxima_a_anadir <= 0:
                      # Si ya no puedo añadir nada más
                      return Response({
                          "error": f"No puedes añadir más '{producto.nombre}'. Ya tienes {cantidad_actual_en_carrito} y solo quedan {stock_disponible} en stock.",
                          "stock_disponible": stock_disponible
                      }, status=status.HTTP_400_BAD_REQUEST)
                 else:
                      # Añado solo lo que puedo y mando advertencia
                      item.cantidad += cantidad_maxima_a_anadir
                      item.save()
                      serializer = CarritoSerializer(carrito, context={'request': request})
                      return Response({
                          'mensaje': f"Stock limitado. Se agregaron {cantidad_maxima_a_anadir} unidad(es) de '{producto.nombre}'. Total en carrito: {item.cantidad}.",
                          'stock_limitado': True,
                          'carrito': serializer.data
                      }, status=status.HTTP_200_OK)
            else:
                 # Si hay stock suficiente para la cantidad pedida
                 item.cantidad += cantidad
                 item.save()
                 serializer = CarritoSerializer(carrito, context={'request': request})
                 return Response({
                     'mensaje': f"{cantidad} x '{producto.nombre}' agregado(s) correctamente.",
                     'stock_limitado': False,
                     'carrito': serializer.data
                 }, status=status.HTTP_200_OK)

        except Producto.DoesNotExist:
             return Response({"error": "El producto no existe o no está disponible"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             print(f"Error al agregar item al carrito: {e}")
             return Response({"error": "Error interno al agregar el producto"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EliminarItemCarrito(APIView):
    """ API para eliminar un item del carrito. """
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, producto_id):
        try:
            carrito = get_object_or_404(Carrito, usuario=request.user)
            item = get_object_or_404(CarritoItem, carrito=carrito, producto_id=producto_id)
            item.delete()
            # Devuelvo el carrito actualizado tras eliminar
            serializer = CarritoSerializer(carrito, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except (Carrito.DoesNotExist, CarritoItem.DoesNotExist):
            return Response({"error": "Producto no encontrado en el carrito"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             print(f"Error al eliminar item del carrito: {e}")
             return Response({"error": "Error interno al eliminar el producto"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Vistas de Páginas Normales ---
# (pgbienvenida, buscar_productos, nosotros, contacto, carrito, login, registro_cliente - sin cambios)
@login_required
def pgbienvenida(request):
    metodos_pago = MetodoPago.objects.all()
    context = { 'metodos_pago': metodos_pago, }
    return render(request, 'Tienda/pgbienvenida.html', context)
@login_required
def buscar_productos(request):
    q = request.GET.get('q', '')
    metodos_pago = MetodoPago.objects.all()
    categorias = Categoria.objects.all()
    if q:
        productos = Producto.objects.filter(nombre__icontains=q, disponible=True).select_related('categoria')
    else:
        productos = Producto.objects.filter(disponible=True).select_related('categoria')
    context = {
        'productos': productos, 'query': q,
        'metodos_pago': metodos_pago, 'categorias': categorias,
    }
    return render(request, 'Tienda/tienda.html', context)


@login_required
def nosotros(request):
    return render(request, 'Tienda/nosotros.html')


@login_required
def contacto(request):
    return render(request, 'Tienda/contacto.html')

@login_required
def carrito(request):
    return render(request, 'Tienda/carrito.html')

def login(request):
    return render(request, 'Tienda/login.html')

def registro_cliente(request):
    return render(request, 'Tienda/registro_cliente.html')

# --- Vista del Dashboard ---
# La protección se hace en JS verificando el token
@login_required
def dashboard_view(request):
    context = {}
    return render(request, 'Tienda/dashboard.html', context)

# --- Vista para Procesar Pedido ---
# Requiere que el usuario esté logueado (verificado en JS con el token)
# Se podría añadir @login_required si se usara autenticación de sesión Django estándar
class ProcesarPedidoView(APIView):
    """ API para procesar el carrito y convertirlo en un pedido. """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            carrito = get_object_or_404(Carrito, usuario=request.user)
            if not carrito.items.exists():
                 return Response({'error': 'Carrito vacío'}, status=status.HTTP_400_BAD_REQUEST)

            total = carrito.total

            with transaction.atomic():
                # Creo el pedido
                pedido = Pedido.objects.create(usuario=request.user, total=total, completado=False) # Inicialmente no completado

                # Creo los detalles y actualizo stock
                for item in carrito.items.all():
                    producto_actual = item.producto
                    # Doble chequeo de stock dentro de la transacción
                    if producto_actual.stock < item.cantidad:
                        # Si falla el stock aquí, la transacción hará rollback
                        raise ValueError(f"Stock insuficiente para '{producto_actual.nombre}'. Disponible: {producto_actual.stock}")

                    DetallePedido.objects.create(
                        pedido=pedido,
                        producto=producto_actual,
                        cantidad=item.cantidad,
                        precio_unitario=producto_actual.precio # Precio al momento de la compra
                    )
                    producto_actual.stock -= item.cantidad
                    producto_actual.save()

                # Puedes cambiar el estado aquí si lo deseas (ej. a 'procesando')
                # pedido.estado = 'procesando' # Si tuvieras un campo estado
                pedido.completado = True # O marcar como completado si el pago es inmediato
                pedido.save()

                # Vacío el carrito
                carrito.items.all().delete()

            return Response({'mensaje': 'Pedido procesado exitosamente!', 'pedido_id': pedido.id}, status=status.HTTP_201_CREATED)

        except Carrito.DoesNotExist:
            return Response({'error': 'No se encontró tu carrito'}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as ve: # Error de stock
            return Response({'error': str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error crítico al procesar pedido: {e}")
            return Response({'error': 'Error interno al procesar tu pedido.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- Vistas de API para el Perfil ---
# Necesitarás crear estas vistas si no existen en usuarios/views.py

class PerfilUsuarioAPI(APIView):
     permission_classes = [permissions.IsAuthenticated]
     # Deberías tener el serializer correcto importado
     # from usuarios.serializers import UserProfileSerializer

     def get(self, request):
         # Devuelvo el perfil del usuario autenticado
         # serializer = UserProfileSerializer(request.user, context={'request': request})
         # return Response(serializer.data)
         # Placeholder si no tienes el serializer UserProfileSerializer listo
         return Response({
             "id": request.user.id,
             "email": request.user.email,
             "nombre": request.user.nombre,
             "apellido": request.user.apellido,
             "tipo_documento": request.user.tipo_documento,
             "numero_documento": request.user.numero_documento,
             "biografia": request.user.biografia,
             "avatar_url": request.build_absolute_uri(request.user.avatar.url) if request.user.avatar else None,
             # Aquí deberías añadir los contadores si los calculas en el modelo o aquí
             "total_pedidos": Pedido.objects.filter(usuario=request.user).count(),
             # "total_direcciones": Direccion.objects.filter(usuario=request.user).count(), # Si tuvieras modelo Direccion
         })


     def put(self, request):
         # Actualizo el perfil (nombre, apellido, telefono, biografia)
         # serializer = UserProfileSerializer(request.user, data=request.data, partial=True, context={'request': request})
         # if serializer.is_valid():
         #     serializer.save()
         #     return Response(serializer.data)
         # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
         # Implementación manual placeholder:
         user = request.user
         user.nombre = request.data.get('nombre', user.nombre)
         user.apellido = request.data.get('apellido', user.apellido)
         user.telefono = request.data.get('telefono', user.telefono) # Necesitas añadir 'telefono' al modelo UsuarioPersonalizado
         user.biografia = request.data.get('biografia', user.biografia)
         user.save()
         # Reutilizo el GET para devolver el perfil actualizado
         return self.get(request)


class SubirFotoPerfilAPI(APIView):
      permission_classes = [permissions.IsAuthenticated]
      # Asegúrate de tener MultiPartParser si no lo tienes globalmente
      # from rest_framework.parsers import MultiPartParser, FormParser
      # parser_classes = [MultiPartParser, FormParser]

      def post(self, request):
          user = request.user
          archivo_foto = request.FILES.get('foto_perfil') # Clave debe coincidir con JS

          if not archivo_foto:
              return Response({"error": "No se envió ningún archivo."}, status=status.HTTP_400_BAD_REQUEST)

          # Validación básica (puedes mejorarla)
          if archivo_foto.size > 5 * 1024 * 1024: # 5MB
              return Response({"error": "El archivo es demasiado grande (máx 5MB)."}, status=status.HTTP_400_BAD_REQUEST)
          allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
          if archivo_foto.content_type not in allowed_types:
              return Response({"error": "Tipo de archivo no válido."}, status=status.HTTP_400_BAD_REQUEST)

          user.avatar = archivo_foto
          user.save()

          avatar_url = request.build_absolute_uri(user.avatar.url) if user.avatar else None
          return Response({
              "mensaje": "Foto de perfil actualizada.",
              "avatar_url": avatar_url
          }, status=status.HTTP_200_OK)


# --- Vistas de API para Pedidos ---

class PedidosUsuarioAPI(APIView):
      permission_classes = [permissions.IsAuthenticated]

      def get(self, request):
           # Aquí implementarías la lógica para filtrar por estado, buscar y paginar
           pedidos = Pedido.objects.filter(usuario=request.user).order_by('-fecha')
           # Añadir paginación y filtros aquí...
           # serializer = PedidoSerializer(pedidos, many=True, context={'request': request}) # Necesitas un PedidoSerializer
           # return Response({'resultados': serializer.data, 'total_paginas': ..., 'count': ...})

           # Placeholder: devolver todos sin paginar/filtrar
           data = [{
               "id": p.id, "fecha": p.fecha, "total": p.total,
               "estado": "Completado" if p.completado else "Pendiente", # Simplificado
               # "puede_cancelar": not p.completado # Lógica simple
               } for p in pedidos]
           return Response({'resultados': data, 'total_paginas': 1}) # Sin paginación real

class DetallePedidoAPI(APIView):
     permission_classes = [permissions.IsAuthenticated]

     def get(self, request, pedido_id):
          pedido = get_object_or_404(Pedido, id=pedido_id, usuario=request.user)
          # serializer = DetallePedidoCompletoSerializer(pedido, context={'request': request}) # Necesitas este serializer
          # return Response(serializer.data)

          # Placeholder:
          detalles = pedido.detalles.all()
          detalles_data = [{
                "cantidad": d.cantidad,
                "precio_unitario": d.precio_unitario,
                "producto": { # Anido info básica del producto
                     "nombre": d.producto.nombre,
                     "imagen_url": request.build_absolute_uri(d.producto.imagen.url) if d.producto.imagen else None
                }
          } for d in detalles]
          return Response({
                "id": pedido.id,
                "fecha": pedido.fecha,
                "total": pedido.total,
                "estado": "Completado" if pedido.completado else "Pendiente",
                "direccion_envio": "Cra XX # YY-ZZ, Ciudad", # Ejemplo, necesita modelo/lógica real
                "metodo_pago": "Tarjeta terminada en 1234", # Ejemplo
                "detalles": detalles_data
          })


# --- Vistas de API para Direcciones (Placeholder) ---
# Necesitarías crear un modelo Direccion y sus serializers

class DireccionesUsuarioAPI(APIView):
      permission_classes = [permissions.IsAuthenticated]
      def get(self, request):
          # Lógica para obtener direcciones del usuario
          # direcciones = Direccion.objects.filter(usuario=request.user)
          # serializer = DireccionSerializer(direcciones, many=True)
          # return Response(serializer.data)
          return Response([]) # Devuelve vacío por ahora

      def post(self, request):
           # Lógica para crear una nueva dirección
           # serializer = DireccionSerializer(data=request.data)
           # if serializer.is_valid():
           #     serializer.save(usuario=request.user)
           #     return Response(serializer.data, status=status.HTTP_201_CREATED)
           # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
           return Response({"mensaje": "Funcionalidad no implementada"}, status=status.HTTP_501_NOT_IMPLEMENTED)


class DireccionDetalleAPI(APIView):
     permission_classes = [permissions.IsAuthenticated]
     def put(self, request, direccion_id):
          # Lógica para actualizar dirección
          # direccion = get_object_or_404(Direccion, id=direccion_id, usuario=request.user)
          # serializer = DireccionSerializer(direccion, data=request.data, partial=True)
          # ... (validar y guardar) ...
           return Response({"mensaje": "Funcionalidad no implementada"}, status=status.HTTP_501_NOT_IMPLEMENTED)

     def delete(self, request, direccion_id):
          # Lógica para eliminar dirección
          # direccion = get_object_or_404(Direccion, id=direccion_id, usuario=request.user)
          # direccion.delete()
          # return Response(status=status.HTTP_204_NO_CONTENT)
           return Response({"mensaje": "Funcionalidad no implementada"}, status=status.HTTP_501_NOT_IMPLEMENTED)

     def post(self, request, direccion_id): # Usado para marcar como predeterminada
          # Lógica para marcar como predeterminada
          # direccion = get_object_or_404(Direccion, id=direccion_id, usuario=request.user)
          # Direccion.objects.filter(usuario=request.user).update(predeterminada=False) # Quita otras
          # direccion.predeterminada = True
          # direccion.save()
          # return Response({"mensaje": "Dirección marcada como predeterminada"})
           return Response({"mensaje": "Funcionalidad no implementada"}, status=status.HTTP_501_NOT_IMPLEMENTED)