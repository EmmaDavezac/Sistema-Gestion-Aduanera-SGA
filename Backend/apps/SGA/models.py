from django.db import models
from django.contrib.auth.models import User
import uuid
import os

def generar_ruta_archivo(instance, filename):
    """Genera una ruta única para los archivos físicos."""
    ext = filename.split('.')[-1]
    nombre_unico = f"{uuid.uuid4()}.{ext}"
    return os.path.join('uploads/documentos/', nombre_unico)

class Aduana(models.Model):
    id = models.IntegerField(primary_key=True)
    nombre = models.CharField(max_length=100)

    class Meta:
        db_table = 'aduanas'

class Cliente(models.Model):
    cuit = models.CharField(max_length=15, primary_key=True)
    nombre = models.CharField(max_length=50)
    domicilio = models.CharField(max_length=40, null=True, blank=True)
    telefono_1 = models.CharField(max_length=20, null=True, blank=True)
    telefono_2 = models.CharField(max_length=20, null=True, blank=True)
    fecha_inicio_actividad = models.DateField(null=True, blank=True)
    observaciones = models.CharField(max_length=300, null=True, blank=True)
    baja = models.BooleanField(default=False)

    class Meta:
        db_table = 'clientes'

    def __str__(self):
        return self.nombre

class Importacion(models.Model):
    numero_destinacion = models.CharField(max_length=50, unique=True)
    condicion_venta = models.CharField(max_length=50, blank=True, null=True)
    vendedor = models.CharField(max_length=100, blank=True, null=True)
    puerto_embarque = models.CharField(max_length=100, blank=True, null=True)
    numero_factura = models.CharField(max_length=50, blank=True, null=True)
    pais_origen = models.CharField(max_length=50, blank=True, null=True)
    pais_destino = models.CharField(max_length=50, blank=True, null=True)
    divisa = models.CharField(max_length=20, blank=True, null=True)
    unitario_en_divisa = models.DecimalField(max_digits=15, decimal_places=2, default=0.0)
    unidad = models.CharField(max_length=20, blank=True, null=True)
    cantidad_unidades = models.IntegerField(default=0)
    fob_total_en_divisa = models.DecimalField(max_digits=20, decimal_places=2, default=0.0)
    fob_total_en_dolar = models.DecimalField(max_digits=20, decimal_places=2, default=0.0)
    numeracion = models.CharField(max_length=50, blank=True, null=True)
    estado = models.CharField(max_length=50, default='Pendiente')
    baja = models.BooleanField(default=False)
    
    # Relaciones
    aduana = models.ForeignKey(Aduana, on_delete=models.PROTECT, related_name='importaciones')
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='importaciones')

    class Meta:
            db_table = 'importaciones'

    def __str__(self):
        return f"Import {self.numero_destinacion} - {self.cliente.nombre}"
    
    

class Exportacion(models.Model):
    oficializacion = models.DateField(null=True, blank=True)
    numero_destinacion = models.CharField(max_length=50, unique=True)
    nombre_transporte = models.CharField(max_length=100, null=True, blank=True)
    puerto_embarque = models.CharField(max_length=100, null=True, blank=True)
    vencimiento_preimposicion = models.DateField(null=True, blank=True)
    vencimiento_embarque = models.DateField(null=True, blank=True)
    condicion_venta = models.CharField(max_length=50, null=True, blank=True)
    divisa = models.CharField(max_length=20, null=True, blank=True)
    numero_factura = models.CharField(max_length=50, null=True, blank=True)
    codigo_afip = models.CharField(max_length=50, null=True, blank=True)
    pais_destino = models.CharField(max_length=50, null=True, blank=True)
    unitario_en_divisa = models.DecimalField(max_digits=15, decimal_places=2, default=0.0)
    unidad = models.CharField(max_length=20, null=True, blank=True)
    cantidad_unidades = models.IntegerField(default=0)
    fob_total_en_divisa = models.DecimalField(max_digits=20, decimal_places=2, default=0.0)
    fob_total_en_dolar = models.DecimalField(max_digits=20, decimal_places=2, default=0.0)
    numeracion = models.CharField(max_length=50, null=True, blank=True)
    estado = models.CharField(max_length=50, default='Inicializada')
    baja = models.BooleanField(default=False)
    
    aduana = models.ForeignKey(Aduana, on_delete=models.PROTECT)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)

   
    class Meta:
        db_table = 'exportaciones'

    def __str__(self):
        return f"Exp {self.numero_destinacion} - {self.cliente.nombre}"

class Archivo(models.Model):
    TIPO_CHOICES = [
        (1, 'Cliente'),
        (2, 'Importación'),
        (3, 'Exportación'),
    ]
    nombre = models.CharField(max_length=255) # Equivale al campo 'nombre' del SQL
    archivo = models.FileField(upload_to=generar_ruta_archivo) # Almacena la ruta (url)
    tipo = models.IntegerField(choices=TIPO_CHOICES)
    
    # Relaciones del SQL
    cuit_cliente = models.ForeignKey(Cliente, on_delete=models.SET_NULL, null=True, blank=True, db_column='cuit_cliente')
    id_importacion = models.ForeignKey(Importacion, on_delete=models.SET_NULL, null=True, blank=True, db_column='id_importacion')
    id_exportacion = models.ForeignKey(Exportacion, on_delete=models.SET_NULL, null=True, blank=True, db_column='id_exportacion')
    
    # Usuario que realiza la carga
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    fecha_subida = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'archivos'

    def save(self, *args, **kwargs):
        if self.archivo and not self.nombre:
            self.nombre = self.archivo.name
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nombre
    
  