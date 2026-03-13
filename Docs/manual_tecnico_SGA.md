# Manual Técnico — SGA (Sistema de Gestión de Operaciones Aduaneras)

> **Versión:** 1.0  
> **Fecha:** 2024  
> **Tipo de documento:** Manual Técnico  
> **Institución:** Universidad Tecnológica Nacional — Facultad Regional Concepción del Uruguay  
> **Carrera:** Ingeniería en Sistemas de Información — Habilitación Profesional  
> **Autores:** Luciano Emmanuel Davezac, Antonio Nicolás Villanueva, Franco Michel Rodriguez  
> **Directores:** Ing. Miriam Kloster, Ing. Adrian Callejas  

---

## Índice

1. [Descripción General del Sistema](#1-descripción-general-del-sistema)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Requisitos del Sistema](#3-requisitos-del-sistema)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Base de Datos](#5-base-de-datos)
6. [API REST — Endpoints](#6-api-rest--endpoints)
7. [Autenticación y Seguridad](#7-autenticación-y-seguridad)
8. [Módulos del Backend](#8-módulos-del-backend)
9. [Frontend React](#9-frontend-react)
10. [Instalación y Configuración](#10-instalación-y-configuración)
11. [Migración a MySQL (Producción)](#11-migración-a-mysql-producción)
12. [Roles y Permisos](#12-roles-y-permisos)
13. [Trazabilidad de Requisitos](#13-trazabilidad-de-requisitos)

---

## 1. Descripción General del Sistema

El **SGA (Sistema de Gestión de Operaciones Aduaneras)** es una aplicación web desarrollada para la empresa **Silvina M. Ramírez**, dedicada al rubro de comercio exterior con sede en Concepción del Uruguay, Entre Ríos. La empresa brinda servicios integrales en comercio exterior operando en puertos y aduanas de Argentina, gestionando en promedio unas 100 operaciones mensuales para una cartera de más de 74 clientes.

El sistema reemplaza el proceso anterior basado en hojas de cálculo de Google Sheets y carpetas en Google Drive, que presentaba problemas de redundancia de datos, dificultad en el seguimiento de operaciones, falta de escalabilidad y ausencia de mecanismos de seguridad.

### Problemática resuelta

- **Redundancia de datos:** múltiples planillas con información duplicada.
- **Seguimiento manual:** operaciones gestionadas a través de una agenda virtual sin control de estado.
- **Vencimientos no controlados:** pérdidas monetarias de entre $35.000 ARS y $100 USD por retomar operaciones vencidas.
- **Seguridad:** ausencia de control de acceso a la información.

### Funcionalidades principales

- Gestión de clientes con su información fiscal (CUIT).
- Registro y seguimiento de operaciones de importación y exportación.
- Administración de aduanas asociadas a cada operación.
- Carga, almacenamiento y descarga de documentos digitales por operación.
- Sistema de alertas automático para exportaciones próximas a vencer (dentro de los próximos 7 días).
- Envío de alertas por correo electrónico mediante configuración SMTP.
- Control de acceso mediante autenticación JWT con CAPTCHA.
- Administración de usuarios con roles (administrador / usuario estándar).
- Soporte para despliegue mediante Docker.

---

## 2. Arquitectura del Sistema

El sistema sigue una arquitectura **cliente-servidor desacoplada**, donde el frontend y el backend se comunican exclusivamente a través de una API REST.

```
┌─────────────────────┐         HTTP / JSON          ┌──────────────────────────┐
│                     │  ─────────────────────────►  │                          │
│   Frontend (React)  │                              │   Backend (Django REST)   │
│   Puerto: 5173      │  ◄─────────────────────────  │   Puerto: 8000            │
│                     │         JWT Token            │                          │
└─────────────────────┘                              └────────────┬─────────────┘
                                                                  │
                                                                  ▼
                                                     ┌────────────────────────┐
                                                     │  Base de Datos SQLite  │
                                                     │  (dev) / MySQL (prod)  │
                                                     └────────────────────────┘
```

### Tecnologías utilizadas

| Capa | Tecnología | Descripción |
|------|-----------|-------------|
| Frontend | React 18+ | Interfaz de usuario SPA |
| Backend | Django 4+ | Framework web Python |
| API | Django REST Framework | API REST |
| Autenticación | SimpleJWT | Tokens JWT con claims personalizados |
| CAPTCHA | django-simple-captcha | Verificación en login |
| Base de datos (dev) | SQLite 3 | Entorno de desarrollo |
| Base de datos (prod) | MySQL 8+ | Entorno de producción |
| Correo electrónico | SMTP (Gmail) | Envío de alertas por mail |
| Contenedores | Docker / Docker Compose | Despliegue |

---

## 3. Requisitos del Sistema

### Backend

- Python 3.10 o superior
- pip (gestor de paquetes de Python)
- Virtualenv (recomendado)

### Dependencias Python

```
django
djangorestframework
djangorestframework-simplejwt
django-simple-captcha
mysqlclient          # solo para producción con MySQL
```

### Frontend

- Node.js 18 o superior
- npm o yarn

---

## 4. Estructura del Proyecto

```
SGA/
├── backend/
│   ├── SGA/                        # App principal de Django
│   │   ├── migrations/             # Migraciones de base de datos
│   │   ├── models.py               # Modelos de datos
│   │   ├── views.py                # Vistas y ViewSets
│   │   ├── serializers.py          # Serializadores DRF
│   │   ├── urls.py                 # Rutas de la API
│   │   └── admin.py                # Panel de administración
│   ├── config/                     # Configuración del proyecto Django
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── uploads/
│   │   └── documentos/             # Archivos físicos subidos
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── api.js          # Axios con interceptor JWT
    │   │   ├── auth.js         # Función de login
    │   │   └── axios.js        # Instancia base Axios
    │   ├── assets/             # Recursos estáticos
    │   ├── components/         # Componentes reutilizables
    │   │   ├── AlertasVencimiento.jsx
    │   │   ├── Footer.jsx
    │   │   ├── GestionAduanas.jsx
    │   │   ├── GestionClientes.jsx
    │   │   ├── GestionExportaciones.jsx
    │   │   ├── GestionImportaciones.jsx
    │   │   ├── GestionUsuarios.jsx
    │   │   ├── HomeInfo.jsx
    │   │   ├── Profile.jsx
    │   │   ├── ProfileSkeleton.jsx
    │   │   ├── SkeletonTable.jsx
    │   │   └── Toast.jsx
    │   ├── pages/
    │   │   ├── Home.jsx        # Dashboard principal
    │   │   └── Login.jsx       # Login con CAPTCHA
    │   ├── utils/
    │   │   └── validaciones.js
    │   ├── App.jsx             # Rutas y componente raíz
    │   └── main.jsx            # Punto de entrada
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── Dockerfile
```

---

## 5. Base de Datos

### Diagrama de Entidades

```
┌──────────┐        ┌───────────────┐        ┌────────────┐
│  Aduana  │        │  Importacion  │        │  Cliente   │
│──────────│        │───────────────│        │────────────│
│ id (PK)  │◄───────│ aduana (FK)   │───────►│ cuit (PK)  │
│ nombre   │        │ cliente (FK)  │        │ nombre     │
└──────────┘        │ numero_dest.  │        │ domicilio  │
                    │ oficializ.    │        │ telefono_1 │
                    │ estado        │        │ telefono_2 │
                    │ ...           │        │ baja       │
                    └───────────────┘        └─────┬──────┘
                                                   │
┌──────────┐        ┌───────────────┐              │
│  Aduana  │        │  Exportacion  │              │
│──────────│        │───────────────│              │
│ id (PK)  │◄───────│ aduana (FK)   │──────────────┘
│ nombre   │        │ cliente (FK)  │
└──────────┘        │ numero_dest.  │
                    │ venc_preimpos.│        ┌──────────────┐
                    │ venc_embarque │        │    Archivo   │
                    │ estado        │        │──────────────│
                    │ ...           │◄───────│ id_export(FK)│
                    └───────────────┘        │ id_import(FK)│
                                             │ cuit_cli.(FK)│
                                             │ archivo      │
                                             │ tipo         │
                                             │ user (FK)    │
                                             │ fecha_subida │
                                             └──────────────┘
```

### Descripción de Tablas

#### `aduanas`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER (PK) | Identificador único |
| nombre | VARCHAR(100) | Nombre de la aduana |

#### `clientes`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| cuit | VARCHAR(15) (PK) | CUIT del cliente |
| nombre | VARCHAR(50) | Razón social |
| domicilio | VARCHAR(40) | Dirección (opcional) |
| telefono_1 | VARCHAR(20) | Teléfono principal (opcional) |
| telefono_2 | VARCHAR(20) | Teléfono secundario (opcional) |
| fecha_inicio_actividad | DATE | Inicio de actividad (opcional) |
| observaciones | VARCHAR(300) | Notas internas (opcional) |
| baja | BOOLEAN | Indica si el cliente está dado de baja |

#### `importaciones`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER (PK) | Identificador automático |
| numero_destinacion | VARCHAR(50) | Número único de destinación |
| oficializacion | DATE | Fecha de oficialización |
| condicion_venta | VARCHAR(50) | Condición de venta (FOB, CIF, etc.) |
| vendedor | VARCHAR(100) | Nombre del vendedor |
| puerto_embarque | VARCHAR(100) | Puerto de origen |
| pais_origen | VARCHAR(50) | País de origen |
| pais_destino | VARCHAR(50) | País de destino |
| divisa | VARCHAR(20) | Moneda utilizada |
| fob_total_en_divisa | DECIMAL(20,2) | Valor FOB en divisa original |
| fob_total_en_dolar | DECIMAL(20,2) | Valor FOB en dólares |
| estado | VARCHAR(50) | Estado (default: `Pendiente`) |
| via | VARCHAR(20) | Vía de transporte |
| aduana | FK → Aduana | Aduana interviniente |
| cliente | FK → Cliente | Cliente asociado |
| baja | BOOLEAN | Baja lógica |

#### `exportaciones`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER (PK) | Identificador automático |
| numero_destinacion | VARCHAR(50) | Número único de destinación |
| oficializacion | DATE | Fecha de oficialización |
| vencimiento_preimposicion | DATE | Fecha límite de preimposición |
| vencimiento_embarque | DATE | Fecha límite de embarque |
| condicion_venta | VARCHAR(50) | Condición de venta |
| codigo_afip | VARCHAR(50) | Código AFIP de la mercadería |
| estado | VARCHAR(50) | Estado (default: `Inicializada`) |
| aduana | FK → Aduana | Aduana interviniente |
| cliente | FK → Cliente | Cliente asociado |
| baja | BOOLEAN | Baja lógica |

#### `archivos`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER (PK) | Identificador automático |
| nombre | VARCHAR(255) | Nombre del archivo |
| archivo | FileField | Ruta física del archivo |
| tipo | INTEGER | 1=Cliente, 2=Importación, 3=Exportación |
| cuit_cliente | FK → Cliente | Cliente asociado (opcional) |
| id_importacion | FK → Importacion | Importación asociada (opcional) |
| id_exportacion | FK → Exportacion | Exportación asociada (opcional) |
| user | FK → User | Usuario que subió el archivo |
| fecha_subida | DATETIME | Timestamp automático |

---

## 6. API REST — Endpoints

La API se encuentra bajo el prefijo `/api/`. Todos los endpoints (excepto autenticación y captcha) requieren token JWT en el header:

```
Authorization: Bearer <access_token>
```

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/token/` | Obtener par de tokens JWT (requiere captcha) |
| POST | `/api/token/refresh/` | Renovar el access token |
| GET | `/api/get-captcha/` | Obtener nuevo desafío CAPTCHA |

**Body para `/api/token/`:**
```json
{
  "username": "usuario",
  "password": "contraseña",
  "captcha_key": "clave_del_captcha",
  "captcha_value": "valor_ingresado"
}
```

**Respuesta exitosa:**
```json
{
  "access": "<token>",
  "refresh": "<token>",
  "username": "usuario",
  "isAdmin": false
}
```

---

### Clientes — `/api/clientes/`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/clientes/` | Listar clientes activos |
| POST | `/api/clientes/` | Crear nuevo cliente |
| GET | `/api/clientes/{cuit}/` | Obtener cliente por CUIT |
| PUT | `/api/clientes/{cuit}/` | Actualizar cliente completo |
| PATCH | `/api/clientes/{cuit}/` | Actualizar cliente parcial |
| DELETE | `/api/clientes/{cuit}/` | Eliminar cliente |
| GET | `/api/clientes/todos/` | Listar todos los clientes (incluye bajas) |

> El campo identificador es el **CUIT** (no un ID numérico).

---

### Importaciones — `/api/importaciones/`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/importaciones/` | Listar importaciones |
| POST | `/api/importaciones/` | Registrar nueva importación |
| GET | `/api/importaciones/{id}/` | Obtener importación por ID |
| PUT | `/api/importaciones/{id}/` | Actualizar importación |
| PATCH | `/api/importaciones/{id}/` | Actualizar parcialmente |
| DELETE | `/api/importaciones/{id}/` | Eliminar importación |

---

### Exportaciones — `/api/exportaciones/`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/exportaciones/` | Listar exportaciones |
| POST | `/api/exportaciones/` | Registrar nueva exportación |
| GET | `/api/exportaciones/{id}/` | Obtener exportación por ID |
| PUT | `/api/exportaciones/{id}/` | Actualizar exportación |
| PATCH | `/api/exportaciones/{id}/` | Actualizar parcialmente |
| DELETE | `/api/exportaciones/{id}/` | Eliminar exportación |
| GET | `/api/exportaciones/proximas_a_vencer/` | Exportaciones con vencimiento en los próximos 7 días |

> El endpoint `proximas_a_vencer` devuelve exportaciones donde `vencimiento_preimposicion` es menor o igual a 7 días desde hoy, con `baja=False` y sin oficializar.

---

### Documentos — `/api/documentos/`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/documentos/` | Listar documentos (filtrables por query params) |
| POST | `/api/documentos/` | Subir nuevo documento |
| GET | `/api/documentos/{id}/` | Obtener metadata de un documento |
| DELETE | `/api/documentos/{id}/` | Eliminar documento |
| GET | `/api/documentos/{id}/descargar/` | Descargar el archivo físico |

**Filtros disponibles por query params:**

| Parámetro | Descripción |
|-----------|-------------|
| `?cliente={cuit}` | Documentos de un cliente |
| `?importacion={id}` | Documentos de una importación |
| `?exportacion={id}` | Documentos de una exportación |

**Ejemplo:** `GET /api/documentos/?importacion=5`

---

### Aduanas — `/api/aduanas/`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/aduanas/` | Listar aduanas |
| POST | `/api/aduanas/` | Crear aduana |
| GET | `/api/aduanas/{id}/` | Obtener aduana |
| PUT | `/api/aduanas/{id}/` | Actualizar aduana |
| DELETE | `/api/aduanas/{id}/` | Eliminar aduana |

---

### Usuarios — `/api/usuarios/`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/usuarios/` | Listar usuarios |
| POST | `/api/usuarios/` | Crear usuario |
| GET | `/api/usuarios/{id}/` | Obtener usuario |
| PUT | `/api/usuarios/{id}/` | Actualizar usuario |
| PATCH | `/api/usuarios/{id}/` | Actualizar parcialmente |
| DELETE | `/api/usuarios/{id}/` | Eliminar usuario |

> Todos los endpoints de usuarios requieren autenticación. La creación de contraseña se maneja con `create_user` de Django para asegurar el hash correcto.

---

## 7. Autenticación y Seguridad

### Flujo de autenticación

```
1. Cliente solicita CAPTCHA  →  GET /api/get-captcha/
                                 ← { key, image_url }

2. Usuario completa form     →  POST /api/token/
   con usuario, contraseña        { username, password,
   y código captcha                 captcha_key, captcha_value }
                                 ← { access, refresh, username, isAdmin }

3. Requests autenticados     →  Header: Authorization: Bearer <access>

4. Token expirado            →  POST /api/token/refresh/
                                 { refresh }
                                 ← { access }
```

### Claims del JWT

El token JWT incluye claims personalizados:

| Claim | Descripción |
|-------|-------------|
| `username` | Nombre de usuario |
| `is_staff` | Indica si el usuario es administrador |

### Consideraciones de seguridad

- Los archivos se almacenan con nombres UUID para evitar colisiones y exposición de nombres originales.
- El CAPTCHA se valida server-side y se elimina tras su uso (no reutilizable).
- Todos los endpoints de datos requieren `IsAuthenticated`.
- El endpoint de captcha es `AllowAny` por necesidad funcional.

---

## 8. Módulos del Backend

### `models.py`

Define las entidades del dominio:

- **`Aduana`** — Entidad simple con ID y nombre.
- **`Cliente`** — Identificado por CUIT, con soporte de baja lógica.
- **`Importacion`** — Operación de importación vinculada a cliente y aduana.
- **`Exportacion`** — Operación de exportación con fechas de vencimiento críticas.
- **`Archivo`** — Documento digital con relación polimórfica (puede pertenecer a cliente, importación o exportación).

La función `generar_ruta_archivo` genera rutas únicas con UUID para cada archivo subido en `uploads/documentos/`.

### `serializers.py`

- Todos los serializadores extienden `ModelSerializer`.
- `ImportacionSerializer` y `ExportacionSerializer` incluyen campos de solo lectura `cliente_nombre` y `aduana_nombre` para facilitar la visualización en frontend.
- `ArchivoSerializer` incluye `tipo_display` (texto legible) y `nombre_cliente`.
- `UserSerializer` maneja creación y actualización de contraseñas de forma segura.

### `views.py`

- Todos los recursos usan `ModelViewSet` (CRUD completo automático).
- **Acción personalizada `todos`** en `ClienteViewSet`: devuelve todos los clientes incluyendo los dados de baja.
- **Acción personalizada `descargar`** en `ArchivoViewSet`: sirve el archivo físico con `FileResponse`.
- **Acción personalizada `proximas_a_vencer`** en `ExportacionViewSet`: filtra exportaciones con vencimiento en los próximos 7 días.
- `MyTokenObtainPairView` extiende la vista estándar JWT para validar CAPTCHA antes de emitir tokens.

---

## 9. Frontend React

El frontend es una SPA (Single Page Application) desarrollada con **React** que consume la API REST del backend mediante solicitudes HTTP autenticadas con JWT.

### Estructura de carpetas

```
frontend/
├── src/
│   ├── api/
│   │   ├── api.js            # Instancia base de Axios con interceptor de autenticación
│   │   ├── auth.js           # Función de login: obtiene y almacena tokens JWT
│   │   └── axios.js          # Configuración base de Axios (baseURL)
│   ├── assets/               # Recursos estáticos (imágenes, íconos)
│   ├── components/           # Componentes reutilizables
│   │   ├── AlertasVencimiento.jsx    # Muestra exportaciones próximas a vencer
│   │   ├── Footer.jsx
│   │   ├── GestionAduanas.jsx        # CRUD de aduanas
│   │   ├── GestionClientes.jsx       # CRUD de clientes
│   │   ├── GestionExportaciones.jsx  # CRUD de exportaciones
│   │   ├── GestionImportaciones.jsx  # CRUD de importaciones
│   │   ├── GestionUsuarios.jsx       # CRUD de usuarios (solo admin)
│   │   ├── HomeInfo.jsx              # Información del dashboard
│   │   ├── Profile.jsx               # Vista de perfil del usuario
│   │   ├── ProfileSkeleton.jsx       # Skeleton loader del perfil
│   │   ├── SkeletonTable.jsx         # Skeleton loader de tablas
│   │   └── Toast.jsx                 # Notificaciones emergentes
│   ├── pages/
│   │   ├── Home.jsx          # Página principal (dashboard)
│   │   └── Login.jsx         # Página de autenticación con CAPTCHA
│   ├── utils/
│   │   └── validaciones.js   # Funciones de validación de formularios
│   ├── App.jsx               # Componente raíz y definición de rutas
│   ├── App.css
│   ├── index.css
│   └── main.jsx              # Punto de entrada de la aplicación
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
└── Dockerfile
```

### Capa de comunicación con la API

La configuración HTTP se centraliza en `src/api/`:

**`axios.js`** — Define la instancia base con la URL del backend:

```js
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});
```

**`api.js`** — Agrega un interceptor que inyecta automáticamente el token JWT en cada request:

```js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

De esta forma, todos los componentes que importen `api` realizan requests autenticados sin necesidad de gestionar el header manualmente en cada llamada.

**`auth.js`** — Gestiona el proceso de login:

```js
export const login = async (username, password, captcha_key, captcha_value) => {
  const response = await api.post("token/", { username, password, captcha_key, captcha_value });
  const token = response.data.access;
  localStorage.setItem("token", token);
  localStorage.setItem("refresh", response.data.refresh);
  const decoded = jwtDecode(token);
  localStorage.setItem("isAdmin", String(decoded.is_staff));
  localStorage.setItem("userName", String(decoded.username));
};
```

Tras el login exitoso, los siguientes datos quedan almacenados en `localStorage`:

| Clave | Contenido |
|-------|-----------|
| `token` | Access token JWT |
| `refresh` | Refresh token JWT |
| `isAdmin` | `"true"` o `"false"` según el claim `is_staff` |
| `userName` | Nombre de usuario del claim JWT |

### Componentes principales

| Componente | Descripción |
|-----------|-------------|
| `GestionImportaciones.jsx` | Listado, registro, modificación, baja/alta y adjuntar archivos a importaciones |
| `GestionExportaciones.jsx` | Ídem para exportaciones, incluye indicador de vencimiento |
| `GestionClientes.jsx` | ABM de clientes con búsqueda por nombre/CUIT y adjuntar archivos |
| `GestionUsuarios.jsx` | ABM de usuarios, visible solo para administradores |
| `GestionAduanas.jsx` | Registro y eliminación de aduanas |
| `AlertasVencimiento.jsx` | Panel en el dashboard que lista exportaciones próximas a vencer o vencidas |
| `Toast.jsx` | Notificación emergente con animación de entrada y barra de tiempo de 10 segundos. Soporta tipos `success` y `error` |
| `SkeletonTable.jsx` | Placeholder animado que se muestra mientras cargan los datos de una tabla |
| `ProfileSkeleton.jsx` | Placeholder animado para la vista de perfil del usuario |

### Flujo de login

```
Página Login
    │
    ├─► GET /api/get-captcha/  →  Obtiene imagen CAPTCHA y clave
    │
    ├─► Usuario completa: usuario + contraseña + texto CAPTCHA
    │
    └─► POST /api/token/  { username, password, captcha_key, captcha_value }
            │
            ├─► Éxito:
            │       ├─ Decodifica JWT (jwtDecode)
            │       ├─ Guarda token, refresh, isAdmin, userName en localStorage
            │       └─ Redirige a /home (dashboard)
            │
            └─► Error:
                    ├─ Muestra Toast de error
                    └─ Regenera CAPTCHA
```

### Notificaciones — Toast

El componente `Toast` se auto-cierra a los 10 segundos con una barra de progreso animada. Puede instanciarse desde cualquier componente para informar resultados de operaciones CRUD:

- **Verde** (`success`): operación completada exitosamente.
- **Rojo** (`error`): fallo en la operación o validación.

---

### Dependencias del Frontend

#### Producción

| Paquete | Versión | Uso |
|---------|---------|-----|
| `react` | 19.2.0 | Librería principal de UI |
| `react-dom` | 19.2.0 | Renderizado en el DOM |
| `react-router-dom` | 7.12.0 | Navegación entre páginas (`/`, `/login`) |
| `axios` | 1.13.2 | Cliente HTTP para consumir la API REST |
| `jwt-decode` | 4.0.0 | Decodificación del payload del token JWT |
| `framer-motion` | 12.31.0 | Animaciones de UI (menú desplegable, tarjetas) |
| `@fortawesome/fontawesome-free` | 7.1.0 | Íconos (FA Solid, FA Brands) |

#### Desarrollo

| Paquete | Versión | Uso |
|---------|---------|-----|
| `vite` | 7.2.4 | Bundler y servidor de desarrollo |
| `@vitejs/plugin-react` | 5.1.1 | Soporte React en Vite (Fast Refresh) |
| `vite-plugin-pwa` | 1.2.0 | Soporte Progressive Web App |
| `eslint` | 9.39.1 | Análisis estático de código |
| `eslint-plugin-react-hooks` | 7.0.1 | Reglas de linting para hooks |
| `eslint-plugin-react-refresh` | 0.4.24 | Compatibilidad con Hot Module Replacement |

---

## 10. Instalación y Configuración

El sistema puede ejecutarse de dos formas: mediante **Docker** (recomendado) o de forma manual.

---

### Variables de entorno

El proyecto utiliza variables de entorno tanto en el backend como en el frontend. A continuación se detallan todas las variables necesarias, cómo configurarlas y qué cambios de código son necesarios para que funcionen correctamente desde archivos `.env`.

#### Backend — `backend/.env`

Crear el archivo `backend/.env` con el siguiente contenido:

```env
SECRET_KEY=tu_clave_secreta_django_aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
EMAIL_HOST_USER=tu_correo@gmail.com
EMAIL_HOST_PASSWORD=tu_contraseña_de_aplicacion
```

**`backend/.env.example`** (versionar este archivo, nunca el `.env`):

```env
SECRET_KEY=
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
```

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `SECRET_KEY` | Clave secreta de Django. Debe ser única, larga y aleatoria | Sí |
| `DEBUG` | `True` en desarrollo, `False` en producción | Sí |
| `ALLOWED_HOSTS` | Hosts permitidos, separados por coma | Sí |
| `EMAIL_HOST_USER` | Correo Gmail para envío de alertas de vencimiento | No* |
| `EMAIL_HOST_PASSWORD` | Contraseña de aplicación de Gmail (no la contraseña personal) | No* |

> *Sin estas variables el sistema funciona normalmente pero no envía correos de alerta. Para Gmail se debe generar una **contraseña de aplicación** desde la configuración de seguridad de la cuenta Google.

**Corrección necesaria en `backend/settings.py`:**

No requiere dependencias adicionales. Agregar al inicio del archivo y reemplazar los valores hardcodeados:

```python
# settings.py — ANTES (valores hardcodeados)
SECRET_KEY = 'django-insecure-...'
DEBUG = True
EMAIL_HOST_USER = 'correo@gmail.com'
EMAIL_HOST_PASSWORD = '1234'

# settings.py — DESPUÉS (usando os.environ)
import os

SECRET_KEY = os.environ.get('SECRET_KEY', 'clave-local-de-desarrollo')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
```

> En Docker las variables se inyectan directamente desde `docker-compose.yml`.
> En instalación manual, exportarlas antes de correr el servidor:
>
> ```bash
> # Windows (PowerShell)
> $env:SECRET_KEY="mi-clave-secreta"
> python manage.py runserver
>
> # Linux/Mac
> export SECRET_KEY="mi-clave-secreta"
> python manage.py runserver
> ```
>
> O bien cargar el `.env` manualmente una sola vez con `set -a && source .env && set +a` en Linux/Mac.

---

#### Frontend — `frontend/.env`

Crear el archivo `frontend/.env` con el siguiente contenido:

```env
VITE_API_URL=http://127.0.0.1:8000
```

**`frontend/.env.example`**:

```env
VITE_API_URL=http://127.0.0.1:8000
```

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL base del backend Django | `http://127.0.0.1:8000` |

> En Vite, todas las variables de entorno expuestas al cliente **deben comenzar con `VITE_`**.

**Corrección necesaria en `frontend/src/api/api.js` y `frontend/src/api/axios.js`:**

Actualmente la URL del backend está hardcodeada en dos archivos. Corregir ambos para que lean desde la variable de entorno:

```js
// src/api/axios.js — ANTES
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// src/api/axios.js — DESPUÉS
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/`,
});
```

```js
// src/api/api.js — ANTES
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// src/api/api.js — DESPUÉS
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/`,
});
```

> Actualmente `Login.jsx` ya usa `import.meta.env.VITE_API_URL` correctamente para la llamada al CAPTCHA, pero `api.js` y `axios.js` tienen la URL hardcodeada. Unificando todo en estas dos líneas, toda la aplicación queda configurada desde el `.env`.

---

#### `.gitignore` recomendado

Asegurarse de que los archivos `.env` **nunca** se suban al repositorio:

```gitignore
# Backend
backend/.env

# Frontend
frontend/.env
```

Los archivos `.env.example` **sí deben** versionarse — sirven como referencia para otros desarrolladores.

---

### Opción A — Docker (recomendado)

#### Requisitos previos

- Docker Desktop instalado y en ejecución.
- Credenciales de una cuenta Gmail para el envío de alertas por correo.

#### Pasos

**1. Descomprimir el proyecto** y ubicar la consola (PowerShell o CMD) en la carpeta raíz.

**2. Crear el archivo `backend/.env`** con las variables indicadas en la sección anterior. Como alternativa, configurarlas directamente en `docker-compose.yml`:

```yaml
environment:
  - SECRET_KEY=tu_clave_secreta
  - DEBUG=True
  - EMAIL_HOST_USER=tu_correo@gmail.com
  - EMAIL_HOST_PASSWORD=tu_contraseña_de_aplicacion
```

**3. Crear el archivo `frontend/.env`** con la URL del backend:

```env
VITE_API_URL=http://localhost:8000
```

**4. Construir e iniciar los contenedores:**

```bash
docker-compose up --build
```

**5. Aplicar migraciones** (la base de datos ya está incluida, esto sincroniza el esquema):

```bash
docker exec -it sga_backend python manage.py migrate
```

**6. Acceder a la aplicación:**

- URL: `http://localhost:5173`
- Usuario por defecto: `emma`
- Contraseña por defecto: `1234`

---

### Opción B — Instalación manual

#### Backend

```bash
# 1. Posicionarse en la carpeta backend
cd backend/

# 2. Crear entorno virtual
python -m venv venv

# 3. Activar el entorno virtual
venv\Scripts\activate        # Windows
source venv/bin/activate     # Linux/Mac

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Crear el archivo .env (ver tabla de variables más arriba)
cp .env.example .env
# Editar .env con los valores reales

# 6. Crear la base de datos y aplicar migraciones
python manage.py makemigrations
python manage.py migrate

# 7. Crear usuario administrador
python manage.py createsuperuser

# 8. Iniciar el servidor
python manage.py runserver
```

La API quedará disponible en `http://localhost:8000/api/`.

#### Frontend

```bash
# 1. Posicionarse en la carpeta frontend
cd frontend/

# 2. Instalar dependencias
npm install

# 3. Crear el archivo .env (ver tabla de variables más arriba)
cp .env.example .env
# Editar .env si el backend corre en una URL diferente

# 4. Iniciar servidor de desarrollo
npm run dev
```

La aplicación quedará disponible en `http://localhost:5173`.

---

## 11. Migración a MySQL (Producción)

Para pasar de SQLite a MySQL en el entorno de producción:

### 1. Instalar el driver

```bash
pip install mysqlclient
```

### 2. Crear la base de datos en MySQL

```sql
CREATE DATABASE sga_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sga_user'@'localhost' IDENTIFIED BY 'contraseña_segura';
GRANT ALL PRIVILEGES ON sga_db.* TO 'sga_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Actualizar `settings.py`

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'sga_db',
        'USER': 'sga_user',
        'PASSWORD': 'contraseña_segura',
        'HOST': 'localhost',
        'PORT': '3306',
        'OPTIONS': {
            'charset': 'utf8mb4',
        },
    }
}
```

### 4. Aplicar migraciones

```bash
python manage.py migrate
```

> **Nota:** Al migrar desde SQLite a MySQL, si ya existen datos en desarrollo, se recomienda usar `python manage.py dumpdata` para exportarlos y `loaddata` para importarlos en la nueva base de datos.

---

## 12. Roles y Permisos

El sistema distingue dos roles de usuario:

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Administrador** | Dueño o encargado del sistema | CRUD completo en todas las entidades, gestión de usuarios, altas y bajas de operaciones |
| **Usuario estándar** | Empleado operativo | Consulta, registro y modificación de operaciones; sin acceso a gestión de usuarios ni bajas lógicas |

> Esta distinción está implementada a través del campo `is_staff` del modelo `User` de Django, propagado en el payload del token JWT mediante el claim `isAdmin`.

---

## 13. Trazabilidad de Requisitos

Los siguientes requisitos funcionales definidos en el análisis fueron implementados en el sistema:

| RF | Descripción | Endpoint implementado |
|----|-------------|----------------------|
| RF01 | Registrar Importación | `POST /api/importaciones/` |
| RF02 | Consultar Importación | `GET /api/importaciones/{id}/` |
| RF03 | Modificar Importación | `PUT/PATCH /api/importaciones/{id}/` |
| RF04 | Dar de baja Importación | `PATCH /api/importaciones/{id}/` (baja=true) |
| RF05 | Dar de alta Importación | `PATCH /api/importaciones/{id}/` (baja=false) |
| RF06 | Buscar Importación | `GET /api/importaciones/` |
| RF07 | Adjuntar archivo a Importación | `POST /api/documentos/` |
| RF08 | Eliminar archivo de Importación | `DELETE /api/documentos/{id}/` |
| RF09 | Registrar Exportación | `POST /api/exportaciones/` |
| RF10-RF16 | CRUD Exportación + archivos | `/api/exportaciones/` |
| RF17-RF22 | CRUD Usuarios | `/api/usuarios/` |
| RF23-RF30 | CRUD Clientes + archivos | `/api/clientes/` |
| RF31-RF33 | CRUD Aduanas | `/api/aduanas/` |
| RF34 | Alertar vencimientos | `GET /api/exportaciones/proximas_a_vencer/` + envío SMTP |
| RF35 | Autenticación | `POST /api/token/` |
| RF36 | Gestión de roles | Campo `is_staff` + JWT claim `isAdmin` |

---

*Documento técnico desarrollado en el marco de la materia Habilitación Profesional — UTN FRCU — 2024*