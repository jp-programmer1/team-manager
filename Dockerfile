# Imagen base
FROM node:20

# Directorio de trabajo
WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos dependencias forzando npm install -f
RUN npm install -f

# Copiamos el resto del proyecto
COPY . .

# Build (opcional, si tu app lo requiere)
RUN npm run build

# Puerto (si es necesario para Railway)
EXPOSE 3000

# Comando de inicio
CMD ["npm", "run", "preview"]
