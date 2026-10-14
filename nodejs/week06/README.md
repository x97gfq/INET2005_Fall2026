# Week 6: Full Stack and APIs

| | Topic | Activities |
|---|---|---|
| **Class 1** | Full stack, monolith vs. microservices, REST, a CRUD API with Express + Mongoose over `sample_mflix`, pagination, REST Client / Postman, Swagger | Activity 5: Comments Service (a second microservice) |

Class 1 was carried forward from week 5, class 2 (class missed). The code moved from
`week05/class2/` to `week06/class1/`.

Slides: `slides/nodejs_week6.pptx` (built by `slides/build_week6_deck.js`).

## Before class

Run these from the **repo root**, where `docker-compose.yml` lives:

```bash
git pull
docker compose up -d
```

Load MongoDB's sample movie database. It's about 60 MB, downloaded once, and safe to re-run
(it skips what's already loaded, so nothing happens if you ran it in week 5):

```bash
docker compose exec node node week06/class1/00_seed_mflix.js
```

Install the **REST Client** extension in VS Code (by Huachao Mao). Postman is optional.

## Cheat sheet

- **server** = keeps running. Open the URL, watch the terminal, **Ctrl+C** to stop it. One server per port.
- **script** = prints to the terminal and exits by itself.

### Class 1

| Slide | What | Type | Command |
|---|---|---|---|
| 8 | Browse the data | Compass | `mongodb://localhost:27017` > `sample_mflix` |
| 9 | Mongoose 1: connect + validation | script | `docker compose exec node node week06/class1/01_mongoose_connect.js` |
| 10-17 | **Movies API** | server | `docker compose exec node node week06/class1/movies-api/server.js` |
| 15 | Requests | VS Code | Open `week06/class1/movies-api/requests.http`, click **Send Request** |
| 15 | Postman | Postman | Import `week06/class1/movies-api/movies-api.postman_collection.json` |
| 18 | **Activity 5**: Comments Service (2nd terminal) | server | `docker compose exec node node week06/class1/activity5/comments_api.js` |

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
| Activity 5: Comments Service | server | `docker compose exec node node week06/class1/_solution/activity5_comments_api.js` |
| Activity 5: requests | VS Code | `week06/class1/_solution/activity5_comments.http` (run both services first) |
| Postman collection, all 15 tests | Windows terminal | `npx newman run nodejs/week06/class1/movies-api/movies-api.postman_collection.json` |

### Housekeeping

| Situation | Command |
|---|---|
| Port 3002 "can't be reached" even with the service running | `docker compose up -d` (picks up the new port) |
| `Cannot find module 'mongoose'` (or swagger...) | `docker compose restart node` (runs `npm install`) |
| Deleted half the movies while testing | `docker compose exec node node week06/class1/00_seed_mflix.js --force` |

## Files

```
week06/
└── class1/
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
