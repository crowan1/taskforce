# taskforce-backend/Dockerfile
FROM php:8.2-fpm

# Installation des dépendances système
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libicu-dev \
    libpq-dev \
    libzip-dev \
    nginx \
    supervisor \
    && docker-php-ext-install \
    intl \
    pdo \
    pdo_mysql \
    pdo_pgsql \
    zip \
    && rm -rf /var/lib/apt/lists/*

# Installation de Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configuration du répertoire de travail
WORKDIR /var/www/html

# Copie des fichiers de configuration Composer
COPY composer.json composer.lock ./

# Installation des dépendances PHP
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copie du code source
COPY . .

# Configuration des permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Configuration Nginx
COPY docker/nginx.conf /etc/nginx/sites-available/default

# Configuration Supervisor
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Création du répertoire var si nécessaire
RUN mkdir -p var/cache var/log \
    && chown -R www-data:www-data var/

# Exécution des commandes Symfony
RUN php bin/console cache:clear --env=prod \
    && php bin/console cache:warmup --env=prod

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
