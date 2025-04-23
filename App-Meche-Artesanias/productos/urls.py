from django.urls import path
from .views import tienda

urlpatterns = [
    path('tienda/', tienda, name='tienda'),
]
