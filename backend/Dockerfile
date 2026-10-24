FROM php:8.4-cli-alpine

RUN apk add --no-cache git unzip libzip-dev postgresql-dev \
    && docker-php-ext-install pdo_pgsql pgsql zip bcmath

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
