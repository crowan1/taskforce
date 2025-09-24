FROM php:8.3-fpm

# Installation des dépendances système
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libjpeg-dev \
    libzip-dev \
    unzip \
    libicu-dev \
    libonig-dev \
    libxml2-dev \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Installation des extensions PHP
RUN docker-php-ext-install -j$(nproc) gd pdo_mysql zip intl opcache

# Installation de Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configuration du répertoire de travail
WORKDIR /var/www/html

# Copie des fichiers de configuration Composer
COPY composer.json ./

# Installation des dépendances Composer (génère composer.lock automatiquement)
RUN composer install --no-scripts --no-autoloader

# Copie du reste de l'application
COPY . .

# Dump de l'autoloader optimisé
RUN composer dump-autoload --optimize

# Droits pour les répertoires de cache et de logs
RUN mkdir -p var/cache var/log var/sessions \
    && chown -R www-data:www-data var/cache var/log var/sessions

# Configuration JWT  
RUN mkdir -p config/jwt \
    && openssl genrsa -out config/jwt/private.pem 2048 \
    && openssl rsa -pubout -in config/jwt/private.pem -out config/jwt/public.pem
RUN chown -R www-data:www-data config/jwt \
    && chmod 600 config/jwt/private.pem \
    && chmod 644 config/jwt/public.pem

# Configuration Nginx
RUN echo 'server { \
    listen 8000; \
    server_name localhost; \
    root /var/www/html/public; \
    index index.php; \
    \
    location / { \
        try_files $uri $uri/ /index.php$is_args$args; \
    } \
    \
    location ~ \.php$ { \
        fastcgi_pass 127.0.0.1:9000; \
        fastcgi_index index.php; \
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; \
        include fastcgi_params; \
    } \
    \
    location ~ /\.ht { \
        deny all; \
    } \
}' > /etc/nginx/sites-available/default

# Expose le port 8000
EXPOSE 8000

# Copie du script d'initialisation
COPY docker/init.sh /init.sh
RUN chmod +x /init.sh

# Script de démarrage
RUN echo '#!/bin/bash\n\
php-fpm -D &\n\
nginx &\n\
/init.sh\n\
# Garder les services en vie\n\
tail -f /dev/null' > /start.sh && chmod +x /start.sh

# Commande par défaut
CMD ["/start.sh"]