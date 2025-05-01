# App-Meche-Artesanias/productos/admin.py
from django.contrib import admin
from .models import Categoria, Producto, Carrito, CarritoItem, Pedido, DetallePedido, MetodoPago # Añado MetodoPago

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre')

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'precio', 'categoria', 'stock', 'disponible', 'fecha_creacion')
    list_filter = ('categoria', 'disponible')
    search_fields = ('nombre',)

# Defino cómo se mostrarán los items del carrito dentro de la vista del carrito.
class CarritoItemInline(admin.TabularInline):
    model = CarritoItem
    fields = ('producto', 'cantidad', 'subtotal_display') # Muestro el subtotal
    readonly_fields = ('subtotal_display',) # Hago el subtotal de solo lectura
    extra = 0 # No muestro formularios extra para añadir items aquí

    # Función para mostrar el subtotal formateado en el admin.
    def subtotal_display(self, obj):
        return f"${obj.subtotal:,.2f}" # Formato moneda
    subtotal_display.short_description = 'Subtotal' # Nombre de la columna

@admin.register(Carrito)
class CarritoAdmin(admin.ModelAdmin):
    # Muestro el ID, el usuario (con su email) y el total del carrito.
    list_display = ('id', 'usuario_email', 'total_display')
    # Añado la sección para ver/editar los items directamente aquí.
    inlines = [CarritoItemInline]
    # Campos de solo lectura que se calculan automáticamente.
    readonly_fields = ('total_display',)
    # Permito buscar carritos por el email del usuario.
    search_fields = ('usuario__email', 'usuario__username')

    # Función para mostrar el email del usuario en la lista.
    def usuario_email(self, obj):
        return obj.usuario.email
    usuario_email.short_description = 'Usuario (Email)' # Nombre de la columna

    # Función para mostrar el total formateado.
    def total_display(self, obj):
        return f"${obj.total:,.2f}" # Formato moneda
    total_display.short_description = 'Total Carrito' # Nombre de la columna


@admin.register(CarritoItem)
class CarritoItemAdmin(admin.ModelAdmin):
    # Vista separada para los items (útil si quiero ver todos los items de todos los carritos).
    list_display = ('id', 'carrito', 'producto', 'cantidad', 'subtotal_display')
    readonly_fields = ('subtotal_display',)
    search_fields = ('producto__nombre', 'carrito__usuario__email')

    def subtotal_display(self, obj):
        return f"${obj.subtotal:,.2f}"
    subtotal_display.short_description = 'Subtotal'

# Registro el resto de modelos que ya tenías.
@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'total', 'fecha', 'completado')
    list_filter = ('completado',)
    search_fields = ('usuario__username', 'usuario__email') # Añado búsqueda por email

@admin.register(DetallePedido)
class DetallePedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'pedido', 'producto', 'cantidad', 'precio_unitario')

@admin.register(MetodoPago) # Registro MetodoPago
class MetodoPagoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre')