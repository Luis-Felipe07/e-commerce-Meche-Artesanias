from rest_framework import serializers
from .models import Carrito, CarritoItem, Producto

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'precio', 'imagen']  # Agrega más si lo deseas

class CarritoItemSerializer(serializers.ModelSerializer):
    producto = ProductoSerializer(read_only=True)

    class Meta:
        model = CarritoItem
        fields = ['id', 'producto', 'cantidad']

class CarritoSerializer(serializers.ModelSerializer):
    items = CarritoItemSerializer(many=True, read_only=True)

    class Meta:
        model = Carrito
        fields = ['id', 'usuario', 'items']
