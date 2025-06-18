# taskforce-frontend/Dockerfile
# Étape de build
FROM node:18-alpine as build

WORKDIR /app

# Copie des fichiers package
COPY package*.json ./

# Installation des dépendances
RUN npm ci --only=production

# Copie du code source
COPY . .

# Build de l'application React
RUN npm run build

# Étape de production avec Nginx
FROM nginx:alpine

# Suppression de la configuration par défaut
RUN rm -rf /usr/share/nginx/html/*

# Copie des fichiers buildés depuis l'étape précédente
COPY --from=build /app/build /usr/share/nginx/html

# Configuration Nginx pour React Router
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]