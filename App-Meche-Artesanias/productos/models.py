# App-Meche-Artesanias/productos/models.py
from django.db import models
from usuarios.models import UsuarioPersonalizado
import decimal # Importo decimal para cálculos precisos

class Categoria(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

class Producto(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    imagen = models.ImageField(upload_to='productos/')
    stock = models.PositiveIntegerField(default=0)
    disponible = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre

class Carrito(models.Model):
    # Mantengo la relación uno a uno con el usuario, perfecto para el carrito del cliente.
    usuario = models.OneToOneField(UsuarioPersonalizado, on_delete=models.CASCADE, related_name='carrito') # Añado related_name

    # Calculo el total sumando los subtotales de cada item.
    @property
    def total(self):
        # Uso Decimal para evitar problemas de precisión con flotantes.
        return sum(item.subtotal for item in self.items.all())

    def __str__(self):
        return f"Carrito de {self.usuario.username}"

class CarritoItem(models.Model):
    # Relacionado al carrito y al producto específico.
    carrito = models.ForeignKey(Carrito, on_delete=models.CASCADE, related_name='items')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)

    # Añado una propiedad para calcular el subtotal de este item fácilmente.
    @property
    def subtotal(self):
        # Multiplico la cantidad por el precio del producto (como Decimal).
        return self.cantidad * decimal.Decimal(self.producto.precio)

    def __str__(self):
        return f"{self.cantidad} x {self.producto.nombre} en {self.carrito}"

class Pedido(models.Model):
    usuario = models.ForeignKey(UsuarioPersonalizado, on_delete=models.CASCADE)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateTimeField(auto_now_add=True)
    completado = models.BooleanField(default=False)

    def procesar_pedido(self):
        if not self.completado:
            for detalle in self.detalles.all():
                # Aseguro que resto stock solo si hay suficiente
                if detalle.producto.stock >= detalle.cantidad:
                    detalle.producto.stock -= detalle.cantidad
                    detalle.producto.save()
                else:
                    # Si no hay stock, debería lanzar un error o manejarlo
                    raise ValueError(f"Stock insuficiente para {detalle.producto.nombre}")
            self.completado = True
            self.save()

    def __str__(self):
        return f'Pedido #{self.id} - {self.usuario.username}'


class DetallePedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.cantidad} x {self.producto.nombre}"


class MetodoPago(models.Model):
    nombre = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre