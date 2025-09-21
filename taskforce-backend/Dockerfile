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
COPY composer.json composer.lock ./

# Installation des dépendances Composer
RUN composer install --no-scripts --no-autoloader

# Copie du reste de l'application
COPY . .

# Dump de l'autoloader optimisé
RUN composer dump-autoload --optimize

# Droits pour les répertoires de cache et de logs
RUN mkdir -p var/cache var/log var/sessions \
    && chown -R www-data:www-data var/cache var/log var/sessions

# Configuration JWT (si nécessaire)
RUN mkdir -p config/jwt \
    && if [ ! -f config/jwt/private.pem ]; then \
        openssl genrsa -out config/jwt/private.pem 2048; \
    fi \
    && if [ ! -f config/jwt/public.pem ]; then \
        openssl rsa -pubout -in config/jwt/private.pem -out config/jwt/public.pem; \
    fi
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
    # Configuration CORS \
    add_header Access-Control-Allow-Origin "http://localhost:3000" always; \
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always; \
    add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always; \
    add_header Access-Control-Allow-Credentials "true" always; \
    \
    # Gestion des requêtes OPTIONS (preflight) \
    location / { \
        if ($request_method = OPTIONS) { \
            add_header Access-Control-Allow-Origin "http://localhost:3000"; \
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"; \
            add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"; \
            add_header Access-Control-Allow-Credentials "true"; \
            add_header Content-Length 0; \
            add_header Content-Type text/plain; \
            return 204; \
        } \
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

# Script de démarrage
RUN echo '#!/bin/bash\n\
service php8.3-fpm start\n\
nginx -g "daemon off;"' > /start.sh && chmod +x /start.sh

# Commande par défaut
CMD ["/start.sh"]