# Dockerfile en `sellia/chat-room-frontend/Dockerfile`

# Usamos una imagen base para Node.js para construir la aplicación Vue
FROM node:18 as build-stage

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de configuración de npm
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto de la aplicación
COPY . .

# Construimos la aplicación
RUN npm run build

# Segunda etapa: utilizamos un servidor web para servir los archivos estáticos
FROM nginx:alpine as production-stage

# Copiamos los archivos de build a la carpeta de NGINX
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copiamos la configuración de NGINX personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80 para acceder a la aplicación Vue
EXPOSE 80

# Iniciamos NGINX
CMD ["nginx", "-g", "daemon off;"]