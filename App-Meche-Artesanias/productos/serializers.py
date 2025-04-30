# App-Meche-Artesanias/productos/serializers.py
from rest_framework import serializers
from .models import Carrito, CarritoItem, Producto, UsuarioPersonalizado # Añado UsuarioPersonalizado

# Serializador básico para mostrar info del producto en el item del carrito.
class ProductoSimpleSerializer(serializers.ModelSerializer):
    imagen_url = serializers.SerializerMethodField() # Campo para la URL completa de la imagen

    class Meta:
        model = Producto
        # Incluyo los campos básicos que necesito mostrar en el carrito.
        fields = ['id', 'nombre', 'precio', 'imagen_url']

    # Obtengo la URL absoluta de la imagen.
    def get_imagen_url(self, obj):
        request = self.context.get('request')
        if obj.imagen and hasattr(obj.imagen, 'url') and request:
            return request.build_absolute_uri(obj.imagen.url)
        return None # O una URL de imagen por defecto

# Serializador para los items dentro del carrito.
class CarritoItemSerializer(serializers.ModelSerializer):
    # Uso el serializer simple de producto para mostrar sus detalles.
    producto = ProductoSimpleSerializer(read_only=True)
    # Campo calculado para el subtotal (viene de la propiedad del modelo).
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    # Necesito el ID del producto para poder añadir/eliminar items por ID.
    producto_id = serializers.PrimaryKeyRelatedField(
        queryset=Producto.objects.all(), source='producto', write_only=True
    )

    class Meta:
        model = CarritoItem
        # Defino los campos que quiero exponer en la API para un item.
        fields = ['id', 'producto', 'cantidad', 'subtotal', 'producto_id']
        read_only_fields = ['id', 'producto', 'subtotal'] # Campos que no se envían al crear/actualizar

# Serializador para el carrito completo.
class CarritoSerializer(serializers.ModelSerializer):
    # Incluyo la lista de items usando su serializador.
    items = CarritoItemSerializer(many=True, read_only=True)
    # Campo calculado para el total del carrito (viene de la propiedad del modelo).
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    # Represento al usuario por su ID (podría usar otro campo si prefiero).
    usuario_id = serializers.ReadOnlyField(source='usuario.id')

    class Meta:
        model = Carrito
        # Campos a exponer para el carrito: ID, ID del usuario, total y la lista de items.
        fields = ['id', 'usuario_id', 'total', 'items']