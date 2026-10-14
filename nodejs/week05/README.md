# Week 5: Node.js + MySQL

| | Topic | Activities |
|---|---|---|
| **Class 1** | Same database, any language: MySQL from Node with `mysql2`, placeholders, the Rolodex page rebuilt in Node, credentials in `.env` | Activity 4: Contacts Search (groundwork for Assignment 2) |
| **Class 2** | Class missed. Carried forward to [week 6, class 1](../week06/README.md) | |

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

Before week 6, class 1, load MongoDB's sample movie database. It's about 60 MB, downloaded once, and safe to re-run:

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
| 4 | PHP version, for comparison | browser | http://localhost |
| 5 | MySQL 1: query | script | `docker compose exec node node week05/class1/01_mysql_query.js` |
| 7 | MySQL 2: placeholders | script | `docker compose exec node node week05/class1/02_placeholders.js son` |
| 7 | ...and the injection | script | `docker compose exec node node week05/class1/02_placeholders.js "' OR '1'='1"` |
| 11 | Create your `.env` (once) | once | `docker compose exec node cp week05/class1/.env.example week05/class1/.env` |
| 11-13 | MySQL 3: dotenv | script | `docker compose exec node node week05/class1/03_dotenv.js` |
| 8 | MySQL 4: Rolodex page | server | `docker compose exec node node week05/class1/04_contacts_page.js` |
| 9 | MySQL 5: two databases | server | `docker compose exec node node week05/class1/05_two_databases.js` |
| 14 | **Activity 4**: Contacts Search | server | `docker compose exec node node week05/class1/activity4/contacts_search.js` |
| 16 | Load `sample_mflix` for week 6 | once | `docker compose exec node node week06/class1/00_seed_mflix.js` |

URLs: http://localhost:3001, http://localhost:3001/api/contacts, http://localhost:3001/api/contacts/2,
and for Activity 4 http://localhost:3001/?search=son.

### Answer keys

| For | Type | Command |
|---|---|---|
| Activity 4: Contacts Search | server | `docker compose exec node node week05/class1/_solution/activity4_contacts_search.js` |

### Housekeeping

| Situation | Command |
|---|---|
| Port 3002 "can't be reached" even with the service running | `docker compose up -d` (picks up the new port) |
| `Cannot find module 'mongoose'` (or dotenv, swagger...) | `docker compose restart node` (runs `npm install`) |
| `ECONNREFUSED` from `03_dotenv.js` | `.env` says `localhost`; inside Docker use `DB_HOST=db`, `DB_PORT=3306` |

## Files

```
week05/
└── class1/
    ├── .env.example                   copy to .env (ignored by Git)
    ├── 01_mysql_query.js     script   mysql2: connect, SELECT, loop
    ├── 02_placeholders.js    script   ? placeholders vs. SQL injection
    ├── 03_dotenv.js          script   settings from .env, with error hints
    ├── 04_contacts_page.js   server   www/index.php in Node, plus /api/contacts
    ├── 05_two_databases.js   server   MySQL and MongoDB on one page
    ├── activity4/contacts_search.js   Activity 4 starter
    └── _solution/                     Activity 4 answer key
```
