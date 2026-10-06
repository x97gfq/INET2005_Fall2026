# Week 5: Node.js + MySQL, then Full Stack and APIs

| | Topic | Activities |
|---|---|---|
| **Class 1** | Same database, any language: MySQL from Node with `mysql2`, placeholders, the Rolodex page rebuilt in Node, credentials in `.env` | Activity 4: Contacts Search (groundwork for Assignment 2) |
| **Class 2** | Full stack, monolith vs. microservices, REST, a CRUD API with Express + Mongoose over `sample_mflix`, pagination, REST Client / Postman, Swagger | Activity 5: Comments Service (a second microservice) |

Slides: `slides/nodejs_week5.pptx` (built by `slides/build_week5_deck.js`).

## Before class

Run these from the **repo root**, where `docker-compose.yml` lives:

```bash
git pull
docker compose up -d     # recreates the node container: new port 3002, new npm packages
```

New this week:
- `docker-compose.yml` publishes **port 3002** so two services can run at once.
- `package.json` adds `dotenv`, `mongoose`, `swagger-ui-express` and `yaml`. The node container installs them when it starts.
- `.gitignore` now ignores every `.env` file.

Before Class 2, load MongoDB's sample movie database. It's about 60 MB, downloaded once, and safe to re-run:

```bash
docker compose exec node node week05/class2/00_seed_mflix.js
```

Install the **REST Client** extension in VS Code (by Huachao Mao). Postman is optional.

## Cheat sheet

- **server** = keeps running. Open the URL, watch the terminal, **Ctrl+C** to stop it. One server per port.
- **script** = prints to the terminal and exits by itself.

### Class 1

| Slide | What | Type | Command |
|---|---|---|---|
| 4 | PHP version, for comparison | browser | http://localhost |
| 5 | MySQL 1: query | script | `docker compose exec node node week05/class1/01_mysql_query.js` |
| 7 | MySQL 2: placeholders | script | `docker compose exec node node week05/class1/02_placeholders.js son` |
| 7 | ...and the injection | script | `docker compose exec node node week05/class1/02_placeholders.js "' OR '1'='1"` |
| 11 | Create your `.env` (once) | once | `docker compose exec node cp week05/class1/.env.example week05/class1/.env` |
| 11-13 | MySQL 3: dotenv | script | `docker compose exec node node week05/class1/03_dotenv.js` |
| 8 | MySQL 4: Rolodex page | server | `docker compose exec node node week05/class1/04_contacts_page.js` |
| 9 | MySQL 5: two databases | server | `docker compose exec node node week05/class1/05_two_databases.js` |
| 14 | **Activity 4**: Contacts Search | server | `docker compose exec node node week05/class1/activity4/contacts_search.js` |
| 16 | Load `sample_mflix` for Class 2 | once | `docker compose exec node node week05/class2/00_seed_mflix.js` |

URLs: http://localhost:3001, http://localhost:3001/api/contacts, http://localhost:3001/api/contacts/2,
and for Activity 4 http://localhost:3001/?search=son.

### Class 2

| Slide | What | Type | Command |
|---|---|---|---|
| 23 | Browse the data | Compass | `mongodb://localhost:27017` > `sample_mflix` |
| 24 | Mongoose 1: connect + validation | script | `docker compose exec node node week05/class2/01_mongoose_connect.js` |
| 25-32 | **Movies API** | server | `docker compose exec node node week05/class2/movies-api/server.js` |
| 30 | Requests | VS Code | Open `week05/class2/movies-api/requests.http`, click **Send Request** |
| 30 | Postman | Postman | Import `week05/class2/movies-api/movies-api.postman_collection.json` |
| 33 | **Activity 5**: Comments Service (2nd terminal) | server | `docker compose exec node node week05/class2/activity5/comments_api.js` |

While the movies API is running:

| URL | What |
|---|---|
| http://localhost:3001 | Front end: search, page, click a movie |
| http://localhost:3001/api/movies?title=matrix | The API |
| http://localhost:3001/api/movies?genre=Western&page=2&limit=5 | Pagination |
| http://localhost:3001/api-docs | Swagger UI |
| http://localhost:3001/openapi.json | The OpenAPI file as JSON (Postman can import it) |
| http://localhost:3002/api/movies/573a139bf29313caabcf3d23/comments | Comments service (Activity 5) |

"Fails alone" demo: with both services running, click a movie (comments appear), Ctrl+C the
comments service, then click another movie. The movies still work.

### Answer keys

| For | Type | Command |
|---|---|---|
| Activity 4: Contacts Search | server | `docker compose exec node node week05/class1/_solution/activity4_contacts_search.js` |
| Activity 5: Comments Service | server | `docker compose exec node node week05/class2/_solution/activity5_comments_api.js` |
| Activity 5: requests | VS Code | `week05/class2/_solution/activity5_comments.http` (run both services first) |
| Postman collection, all 15 tests | Windows terminal | `npx newman run nodejs/week05/class2/movies-api/movies-api.postman_collection.json` |

### Housekeeping

| Situation | Command |
|---|---|
| Port 3002 "can't be reached" even with the service running | `docker compose up -d` (picks up the new port) |
| `Cannot find module 'mongoose'` (or dotenv, swagger...) | `docker compose restart node` (runs `npm install`) |
| Deleted half the movies while testing | `docker compose exec node node week05/class2/00_seed_mflix.js --force` |
| `ECONNREFUSED` from `03_dotenv.js` | `.env` says `localhost`; inside Docker use `DB_HOST=db`, `DB_PORT=3306` |

## Files

```
week05/
├── class1/
│   ├── .env.example                   copy to .env (ignored by Git)
│   ├── 01_mysql_query.js     script   mysql2: connect, SELECT, loop
│   ├── 02_placeholders.js    script   ? placeholders vs. SQL injection
│   ├── 03_dotenv.js          script   settings from .env, with error hints
│   ├── 04_contacts_page.js   server   www/index.php in Node, plus /api/contacts
│   ├── 05_two_databases.js   server   MySQL and MongoDB on one page
│   ├── activity4/contacts_search.js   Activity 4 starter
│   └── _solution/                     Activity 4 answer key
└── class2/
    ├── 00_seed_mflix.js      script   loads sample_mflix (movies, comments, theaters, users)
    ├── 01_mongoose_connect.js script  Mongoose: models, queries, validation
    ├── movies-api/                    the microservice
    │   ├── server.js                  app, middleware, Swagger, error handler
    │   ├── models/Movie.js            schema
    │   ├── routes/movies.js           GET (filter + pagination), POST, PUT, PATCH, DELETE
    │   ├── public/index.html          front end (fetch), calls both services
    │   ├── openapi.yaml               API description for Swagger UI
    │   ├── requests.http              VS Code REST Client requests
    │   └── movies-api.postman_collection.json
    ├── activity5/                     Activity 5 starter: comments_api.js, comments.http
    └── _solution/                     Activity 5 answer key + requests
```
