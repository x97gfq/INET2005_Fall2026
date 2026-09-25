FROM php:8.3-apache
RUN docker-php-ext-install mysqli pdo_mysql
# intl is required by CodeIgniter 4 (www/codeigniter-demo)
RUN apt-get update && apt-get install -y --no-install-recommends libicu-dev \
    && docker-php-ext-install intl \
    && rm -rf /var/lib/apt/lists/*
RUN a2enmod rewrite
RUN a2enmod cgi && a2enconf serve-cgi-bin
