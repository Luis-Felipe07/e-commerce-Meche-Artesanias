from django.shortcuts import render
from .models import Categoria, Producto, MetodoPago, Carrito, CarritoItem
from django.shortcuts import redirect, get_object_or_404
from django.http import JsonResponse
from django.db import transaction
from rest_framework.views import APIView
from .serializers import CarritoSerializer, CarritoItemSerializer
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Carrito, CarritoItem, Producto, Pedido, DetallePedido


def tienda(request):
    categorias   = Categoria.objects.all()
    productos    = Producto.objects.select_related('categoria').all()
    metodos_pago = MetodoPago.objects.all()
    # si tienes un carrito guardado en sesión, calcula num_productos:
    num_productos = request.session.get('carrito', {}).get('cantidad_total', 0)
    
    context = {
        'categorias':    categorias,
        'productos':     productos,
        'metodos_pago':  metodos_pago,
        'num_productos': num_productos,
    }
    return render(request, 'Tienda/tienda.html', context)



class CarritoView(APIView):
    def get(self, request):
        carrito, _ = Carrito.objects.get_or_create(usuario=request.user)
        serializer = CarritoSerializer(carrito)
        return Response(serializer.data)

class AgregarItemCarrito(APIView):
    def post(self, request):
        producto_id = request.data.get('producto_id')
        cantidad = int(request.data.get('cantidad', 1))

        producto = get_object_or_404(Producto, id=producto_id)
        carrito, _ = Carrito.objects.get_or_create(usuario=request.user)
        item, creado = CarritoItem.objects.get_or_create(carrito=carrito, producto=producto)

        if not creado:
            item.cantidad += cantidad
        else:
            item.cantidad = cantidad

        item.save()
        return Response({'mensaje': 'Producto agregado'}, status=status.HTTP_201_CREATED)

class EliminarItemCarrito(APIView):
    def delete(self, request, producto_id):
        carrito = Carrito.objects.get(usuario=request.user)
        item = get_object_or_404(CarritoItem, carrito=carrito, producto_id=producto_id)
        item.delete()
        return Response({'mensaje': 'Producto eliminado'}, status=status.HTTP_204_NO_CONTENT)







def pgbienvenida(request):
    return render(request, 'Tienda/pgbienvenida.html')


def buscar_productos(request):
    q = request.GET.get('q', '')
    if q:
        productos = Producto.objects.filter(nombre__icontains=q)
    else:
        productos = Producto.objects.all()
    return render(request, 'Tienda/tienda.html', {
        'productos': productos,
        'query': q,
    })
    
def nosotros(request):
    return render(request, 'Tienda/nosotros.html')

def contacto(request):
    return render(request, 'Tienda/contacto.html')


def carrito(request):
    return render(request, 'Tienda/carrito.html')

def login(request):
    return render(request, 'Tienda/login.html')

def registro_cliente(request):
    return render(request, 'Tienda/registro_cliente.html')




def procesar_pedido(request):
    carrito = Carrito.objects.get(usuario=request.user)
    total = carrito.calcular_total()

    # Crear el pedido
    pedido = Pedido.objects.create(usuario=request.user, total=total)

    with transaction.atomic():
        for item in carrito.items.all():
            # Crear los detalles del pedido
            DetallePedido.objects.create(
                pedido=pedido,
                producto=item.producto,
                cantidad=item.cantidad,
                precio_unitario=item.producto.precio
            )

            # Reducir el stock del producto
            item.producto.stock -= item.cantidad
            item.producto.save()

        # Limpiar el carrito después de procesar el pedido
        carrito.items.all().delete()

    return JsonResponse({'message': 'Pedido procesado exitosamente.'})