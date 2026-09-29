# Technical Guide: Understanding the Docker LAMP Environment

This document provides a more detailed explanation of the Docker environment used in this project.

# What is LAMP?

LAMP stands for:

- Linux
- Apache
- MySQL
- PHP

In this project, Docker provides isolated containers that run these services.

# What is Docker?

Docker is a containerization platform that packages software and its dependencies into containers.

Benefits:

- Consistent environments
- Easy setup
- Easy distribution
- Easy reset and cleanup

# Understanding Docker Compose

This project uses five containers:

- inet-lamp-web (Apache + PHP)
- inet-lamp-db (MySQL)
- inet-lamp-pma (phpMyAdmin)
- inet-node (Node.js 22, code in `nodejs/`)
- inet-mongo (MongoDB 8)

Docker Compose manages all of them together.

# Port Mapping

Apache:

```yaml
ports:
  - "80:80"
```

MySQL:

```yaml
ports:
  - "13306:3306"
```

phpMyAdmin:

```yaml
ports:
  - "8080:80"
```

Node.js:

```yaml
ports:
  - "3000:3000"   # landing page (nodejs/server.js)
  - "3001:3001"   # the example you are running
```

MongoDB:

```yaml
ports:
  - "27017:27017"
```

# Why MySQL Uses Port 13306

Many Windows systems reserve or already use port 3306. Using port 13306 avoids conflicts while still allowing MySQL Workbench connections.

Workbench settings:

```text
Host: localhost
Port: 13306
Username: root
Password: rootpassword
```

# The Dockerfile

```dockerfile
FROM php:8.3-apache
RUN docker-php-ext-install mysqli pdo_mysql
RUN a2enmod rewrite
```

This image includes:

- Apache
- PHP 8.3
- mysqli
- pdo_mysql
- mod_rewrite

# Volumes

The project uses volumes to persist data.

```yaml
- mysql_data:/var/lib/mysql
```

This allows MySQL data to survive container restarts.

Website files are mapped with:

```yaml
- ./www:/var/www/html
```

# How PHP Connects to MySQL

```php
$conn = new mysqli(
    "db",
    "appuser",
    "apppassword",
    "appdb"
);
```

The hostname is `db` because Docker automatically creates internal networking between services.

# How Node.js Connects to MySQL and MongoDB

The same rule applies to the Node container: it reaches MySQL at `db:3306` and MongoDB at
`mongo:27017`. Those values are passed in as environment variables in `docker-compose.yml` and read
by `nodejs/config.js`:

```javascript
mysql: { host: process.env.MYSQL_HOST || 'localhost', port: Number(process.env.MYSQL_PORT) || 13306, ... },
mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017',
```

The fallbacks after `||` are the ports Docker publishes on your machine, so the same files also
run with a locally installed Node.

Inside a container a server must listen on all interfaces (`app.listen(3001)`), not `127.0.0.1`,
or Docker's port mapping cannot reach it.

The container's `node_modules` lives in a named volume, separate from any `node_modules` you
create by running `npm install` on Windows.

# Database Initialization

Files inside:

```text
initdb/
```

are executed automatically the first time MySQL creates the database.

The sample project creates a contacts table and inserts several records.

Important: initialization scripts only run when the database volume is first created.

MongoDB works the same way: `mongo-init/01_seed_sales.sh` runs `mongoimport` on
`mongo-init/sales.json` the first time the `mongo_data` volume is created, producing the
`inet.sales` collection. There is no username or password on this MongoDB; it is for local
development only.

# Resetting the Database

To completely rebuild the environment:

```bash
docker compose down -v
docker compose up -d --build
```

Warning: this deletes all database data.

# Useful Commands

View containers:

```bash
docker ps
```

View logs:

```bash
docker compose logs
```

View database logs:

```bash
docker compose logs db
```

Run a Node example / open a Mongo shell:

```bash
docker compose exec node node week04/class1/01_hello_http.js
docker compose exec mongo mongosh inet
```

Restart services:

```bash
docker compose restart
```

# Troubleshooting

## Connection Refused

Possible causes:

- MySQL is still starting.
- The database container is not running.
- Credentials are incorrect.

## Table Doesn't Exist

Possible causes:

- Initialization scripts did not run.
- Existing database volume was reused.

Fix:

```bash
docker compose down -v
docker compose up -d --build
```

## Port Already In Use

Choose a different host port.

Example:

```yaml
13306:3306
```

# Concepts Demonstrated

This project demonstrates:

- Docker
- Docker Compose
- Apache
- PHP
- MySQL
- phpMyAdmin
- Node.js and Express
- MongoDB
- Container networking
- Volumes
- Port mapping
- Database initialization scripts
- PHP database connectivity

These concepts provide a foundation for building database-driven web applications.
