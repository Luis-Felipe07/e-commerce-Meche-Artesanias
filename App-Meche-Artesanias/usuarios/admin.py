from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import UsuarioPersonalizado

@admin.register(UsuarioPersonalizado)
class UsuarioAdminPersonalizado(UserAdmin):
    model = UsuarioPersonalizado
    list_display = ('username', 'email', 'nombre', 'apellido', 'is_staff')

    fieldsets = UserAdmin.fieldsets + (
        ('Información adicional', {'fields': ('nombre', 'apellido', 'tipo_documento', 'numero_documento', 'biografia', 'avatar')}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {
            'classes': ('wide',),
            'fields': ('nombre', 'apellido', 'tipo_documento', 'numero_documento', 'biografia', 'avatar'),
        }),
    )

