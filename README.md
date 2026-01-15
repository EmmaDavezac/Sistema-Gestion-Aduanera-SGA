1. Estructura de "Repositorio Único"
En este esquema, el backend y el frontend viven en la misma carpeta raíz pero en subdirectorios independientes. Esto facilita que un solo servidor (o proceso de CI/CD) gestione ambos.
proyecto_total/
├── backend/               # Todo lo de Django (la estructura anterior)
│   ├── apps/
│   ├── core/
│   ├── media/             # Archivos subidos por clientes
│   ├── manage.py
│   └── requirements.txt
├── frontend/              # Todo lo de React (creado con Vite o Create React App)
│   ├── src/
│   │   ├── components/    # Componentes como Uploader.jsx, FileList.jsx
│   │   ├── services/      # Archivos para llamadas a la API (Axios/Fetch)
│   │   ├── App.js
│   │   └── main.jsx
│   ├── public/            # Archivos estáticos del front (favicon, logos)
│   ├── package.json
│   ├── node_modules/
│   └── .env               # Aquí guardas la URL de la API: http://localhost:8000
├── docker-compose.yml     # (Opcional) Para levantar ambos servicios a la vez
└── .gitignore             # Para ignorar venv/, node_modules/ y media/

1. Preparación del Entorno
Desde la carpeta backend/, ejecuta:
```
python -m venv venv
```
Activamos el entorno
```
venv\Scripts\activate
```
Una vez activado, verás (venv) al inicio de la línea de comandos, indicando que estás trabajando en un entorno aislado.

2. Instalar Dependencias
```python
pip install -r requirements.txt
```
3. Crea la base de datos (SQLite):
```
python manage.py makemigrations
python manage.py migrate
```
4. Crea tu usuario administrador:
```
python manage.py createsuperuser
```
5. Inicia el servidor:
```python
python manage.py runserver
```
6. En la carpeta frontend, corre el comando: `npm run dev`.

Abre la URL que te de Vite (ej. http://localhost:5173).