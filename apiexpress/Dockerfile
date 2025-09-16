# Image Node.js officielle
FROM node:18

# Configurer le fuseau horaire français
ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Répertoire de travail
WORKDIR /app

# Copier package.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le code
COPY . .

# Exposer le port 3000
EXPOSE 3000

# Démarrer l'application
CMD ["node", "server.js"]