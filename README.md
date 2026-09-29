# LAMP Docker Starter

## Start

```bash
docker compose up -d --build
```

Website: http://localhost

phpMyAdmin: http://localhost:8080

Node.js: http://localhost:3000 (examples run on http://localhost:3001, see [nodejs/README.md](nodejs/README.md))

MySQL Workbench:
- Host: localhost
- Port: 13306
- User: root
- Password: rootpassword

MongoDB Compass / VS Code MongoDB extension:
- Connection string: mongodb://localhost:27017

A sample contacts database (MySQL) and a sample sales collection (MongoDB `inet.sales`) are automatically created.
