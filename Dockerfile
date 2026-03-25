# ──────────────────────────────────────────────
# Etapa 1: Build con Node
# ──────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Instalar dependencias primero (aprovecha caché de Docker)
COPY package*.json ./
RUN npm ci

# Copiar el resto del código
COPY . .

# Build en modo producción → usa environment.prod.ts (fileReplacements en angular.json)
RUN npm run build -- --configuration production

# ──────────────────────────────────────────────
# Etapa 2: Serve con nginx
# ──────────────────────────────────────────────
FROM nginx:alpine

# Eliminar config default de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar el build generado (Angular SSR genera en dist/browser para el cliente)
COPY --from=build /app/dist/enviostodopais/browser/browser /usr/share/nginx/html

# Copiar configuración nginx personalizada (maneja SPA routing + compresión)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
