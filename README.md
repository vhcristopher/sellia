# Proyecto de Chat en Tiempo Real

Este proyecto es una aplicación de chat en tiempo real que utiliza Vue.js para el frontend, Node.js y Express para el backend, y MongoDB como base de datos. Está diseñado para ejecutarse en un entorno Docker, facilitando su despliegue tanto en Windows como en Linux.

## Prerrequisitos

Antes de comenzar, asegúrate de tener los siguientes componentes instalados en tu sistema:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Instrucciones de Instalación

Sigue los pasos a continuación para clonar el repositorio, construir y ejecutar la aplicación en Docker.

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd stella
```

### 2. Estructura de Carpetas

Asegúrate de que la estructura del proyecto sea similar a esta:

```
sellia/
├── chat-room-frontend/
│   ├── Dockerfile
│   └── ... (otros archivos de frontend)
├── chat-room-backend/
│   ├── Dockerfile
│   └── ... (otros archivos de backend)
└── docker-compose.yml
```

### 3. Variables de Entorno

Crea un archivo `.env` en la carpeta `chat-room-backend` y define la variable de conexión a MongoDB:
En este caso en especifico ya va el .env en el repositorio pero no deberia ir por temas de seguridad en este caso lo permiti por el .gotignore
=>saltarias este paso hasta el ###4

```
no creo que necesites entrar a la base pero pues hay diferentes formas de hacerlo ya sea con mongosh o MondoBDCompase
MONGO_URI=mongodb://mongo:27017/nombre_de_la_base_de_datos
```

### 4. Construir y Ejecutar con Docker

Ejecuta el siguiente comando en la raíz del proyecto para construir y ejecutar los contenedores:

```bash
docker-compose up --build
```

Este comando realizará lo siguiente:

- Construirá la imagen de Docker para el frontend y el backend.
- Creará y levantará contenedores para el frontend, backend y MongoDB.

### 5. Acceder a la Aplicación

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend (API): [http://localhost:5000](http://localhost:5000)

## Endpoints de la API

Algunos endpoints importantes que puedes probar con herramientas como Postman:

- `POST /login` - Iniciar sesión (simulación de autenticación)
- `GET /messages/:roomID` - Obtener mensajes de una sala específica
- `POST /messages` - Enviar un mensaje a una sala

## Notas

- Asegúrate de que los puertos 3000 y 5000 estén disponibles en tu máquina.
- Para detener la aplicación, utiliza `Ctrl+C` en la terminal donde ejecutaste Docker o corre `docker-compose down`.

## Deje este comando por si quieres limpiar la base solo cambia tu ruta ejecuta el  Script de la ruta sellia/scripts/cleanDatabase.js

docker run -it --rm --network host -v C:\Users\Cristopher\Desktop\sellia\scripts:/scripts mongo mongosh "mongodb://localhost:27017/sellia" /scripts/cleanDatabase.js

Explicación del comando:

mongosh "mongodb://localhost:27017/sellia" conecta a la base de datos sellia en el puerto 27017.
-v C:\Users\Cristopher\Desktop\sellia\scripts:/scripts monta tu carpeta de scripts en el contenedor.
/scripts/cleanDatabase.js ejecuta el script que limpia la base de datos.

## Eliminar todos los datos de Docker (contenedores, imágenes, volúmenes y redes):
docker system prune -a --volumes


### Adjunto Links de Funcionamiento y de Instalación



### Autor Cristopher Velazquez Hernandez
### cristopher.velazquez.izcalli@gmail.com 