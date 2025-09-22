FROM node:18-alpine

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers de configuration des dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du code source
COPY . .

# Exposition du port
EXPOSE 3000

# Commande par défaut
CMD ["npm", "start"]

