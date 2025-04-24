from django.shortcuts import render
from django.shortcuts import render
from .models import Categoria, Producto, MetodoPago

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

def bienvenida(request):
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
    return render(request, 'Carrito/carrito.html')

def login(request):
    return render(request, 'Tienda/login.html')
    