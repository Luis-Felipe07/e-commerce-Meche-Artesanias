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
