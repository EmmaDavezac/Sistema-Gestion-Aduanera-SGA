# Intrucciones para la ejecución
1. Tener instalado y corriendo docker
2. Descomprimir la carpeta 
3. Modificar en el archivo docker-compose.yml las sisguientes dos variables de entorno poniendo las credenciale que les dio google
```
    - EMAIL_HOST_USER=
    - EMAIL_HOST_PASSWORD=
```
Sin esto no enviara los mails de alerta.
4.  situar la consola (powershell o cmd) en la carpeta raiz del proyecto 
5. Ejecutar comando para construir el docker
```python
docker-compose up --build  contruir el docker
```
6. Ejecutar el siguiente comando para eliminar las falsas migraciones (ya existe la db)
```
docker exec -it sga_backend python manage.py migrate 
```
7. Ingresar a http://localhost:5173
    usuario:emma
    contraseña:1234

