from django.contrib import admin
from .models import Aduana, Cliente, Importacion, Exportacion, Archivo

admin.site.register(Aduana)
admin.site.register(Cliente)
admin.site.register(Importacion)
admin.site.register(Exportacion)

@admin.register(Archivo)
class ArchivoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'tipo', 'cuit_cliente', 'id_importacion', 'id_exportacion', 'fecha_subida')
    list_filter = ('tipo', 'fecha_subida')
    search_fields = ('nombre', 'cuit_cliente__nombre', 'id_importacion__numero_destinacion')