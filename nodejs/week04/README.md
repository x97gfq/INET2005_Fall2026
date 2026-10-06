# Week 4: Node.js and MongoDB

Two classes this year (no Wednesday):

| | Topic | Activities |
|---|---|---|
| **Class 1** | Node.js on the server, the JavaScript it needs, reading and summarizing JSON | Activity 0: Roll the Dice · Activity 1: Build Your Own Server |
| **Class 2** | MongoDB: documents vs. rows, Compass, `find()` and `aggregate()`, Node + MongoDB | Activity 2: Run the Queries · Activity 3: Sales Page |

Slides: `slides/nodejs_mongodb_week4.pptx` (built by `slides/build_node_mongo_deck.js`).
Assignment 2 (Node + MySQL) starts next week; see [`../week05/`](../week05/README.md).

## Before class

Run these from the **repo root**, where `docker-compose.yml` lives:

```bash
git pull
docker compose up -d --build     # first run: the node container runs npm install (about a minute)
docker ps                        # inet-node and inet-mongo should both be Up
```

Open http://localhost:3000. It should say **ok** for MySQL and for MongoDB (300 documents in `inet.sales`).

## Cheat sheet

Every command below runs from the repo root. `docker compose exec node node <file>` means
"inside the `node` container, run `node` on this file".

- **server** = keeps running. Open http://localhost:3001, watch the terminal, **Ctrl+C** to stop it.
  Only one server can use port 3001 at a time.
- **script** = prints to the terminal and exits by itself.

Changed a file? **Ctrl+C**, then **up arrow + Enter** to run it again. A running server keeps the old code.

### Class 1

| Slide | What | Type | Command |
|---|---|---|---|
| 7 | Demo: start / stop a server | server | `docker compose exec node node week04/class1/01_hello_http.js` |
| 8 | JavaScript refresher | script | `docker compose exec node node week04/class1/00_js_refresher.js` |
| 9 | Non-blocking code | server | `docker compose exec node node week04/class1/04_serve_file.js` |
| 10 | **Example 0**: Rock Paper Scissors | server | `docker compose exec node node week04/class1/example0_rock_paper_scissors.js` |
| 11 | **Activity 0**: Roll the Dice | server | `docker compose exec node node week04/class1/activity0/roll_the_dice.js` |
| 12 | Example 01: hello http | server | `docker compose exec node node week04/class1/01_hello_http.js` |
| 12 | Example 02: JSON API | server | `docker compose exec node node week04/class1/02_json_api.js` |
| 12 | Example 03: HTML response | server | `docker compose exec node node week04/class1/03_html_response.js` |
| 12 | Example 04: serve a file | server | `docker compose exec node node week04/class1/04_serve_file.js` |
| 12 | Example 05: modules | server | `docker compose exec node node week04/class1/05_modules.js` |
| 12-13 | Example 06: Express quotes | server | `docker compose exec node node week04/class1/06_express_quotes.js` |
| 14-15 | Example 07: summarize users | script | `docker compose exec node node week04/class1/07_summarize_users.js` |
| 15 | Example 08: summarize products | script | `docker compose exec node node week04/class1/08_summarize_products.js` |
| 15 | Example 09: summarize orders | script | `docker compose exec node node week04/class1/09_summarize_orders.js` |
| 16-17 | **Activity 1**: Build Your Own Server | server | `docker compose exec node node week04/class1/activity1/my_server.js` |

Useful URLs while a Class 1 server is running:

| Example | Try |
|---|---|
| Example 0 | http://localhost:3001/play?move=banana (400), then Ctrl+C, restart, and check the score |
| 02 | http://localhost:3001, then the CORS test: open http://localhost:3000, F12 > Console, run `fetch('http://localhost:3001').then(r => r.json()).then(console.log)` |
| 06 | http://localhost:3001 and http://localhost:3001/api/quote |
| Activity 1 | http://localhost:3001, http://localhost:3001/about, http://localhost:3001/nope (should be a 404) |

### Class 2

Connect Compass or the VS Code MongoDB extension to `mongodb://localhost:27017` (no username or password).

| Slide | What | Type | Command |
|---|---|---|---|
| 20 | Mongo shell (if no Compass) | shell | `docker compose exec mongo mongosh inet` (paste queries, `exit` to leave) |
| 21 | Import `sales.json` without Compass | once | `docker compose exec mongo mongoimport --db practice --collection sales --jsonArray --file /docker-entrypoint-initdb.d/sales.json` |
| 22-23 | Follow-along queries | Compass | Paste from `week04/class2/queries.mongodb.js`, one at a time |
| 24 | Mongo 1: connect | script | `docker compose exec node node week04/class2/01_mongo_connect.js` |
| 24 | Mongo 2: find | script | `docker compose exec node node week04/class2/02_mongo_find.js` |
| 24 | Mongo 3: aggregate | script | `docker compose exec node node week04/class2/03_mongo_aggregate.js` |
| 24 | Mongo 4: Express + MongoDB | server | `docker compose exec node node week04/class2/04_express_mongo.js` |
| 25 | **Activity 2**: Run the Queries | Compass | Queries from `week04/class2/queries.mongodb.js`, plus one of their own |
| 26 | **Activity 3**: Sales Page | server | `docker compose exec node node week04/class2/activity3/sales_page.js` |

While `04_express_mongo.js` is running: http://localhost:3001 and http://localhost:3001/api/sales?store=Truro.

### Extra practice

| What | Type | Command |
|---|---|---|
| Rock Paper Scissors (write example 0 yourself) | server | `docker compose exec node node week04/practice/rock_paper_scissors.js` |
| Hockey stats | script | `docker compose exec node node week04/practice/hockey_activity.js` |

### Answer keys

| For | Type | Command |
|---|---|---|
| Activity 0: Roll the Dice | server | `docker compose exec node node week04/class1/_solution/activity0_roll_the_dice.js` |
| Activity 1: Build Your Own Server | server | `docker compose exec node node week04/class1/_solution/activity1_my_server.js` |
| Activity 2: checks every query's count | script | `docker compose exec node node week04/class2/_solution/activity2_solution.js` |
| Activity 2: queries with expected counts | file | Open `week04/class2/_solution/activity2_queries.mongodb.js` |
| Activity 3: Sales Page | server | `docker compose exec node node week04/class2/_solution/activity3_sales_page.js` |
| Rock Paper Scissors | server | `docker compose exec node node week04/practice/_solution/rock_paper_scissors.js` |
| Hockey stats | script | `docker compose exec node node week04/practice/_solution/hockey_solution.js` |

### Housekeeping

| Situation | Command |
|---|---|
| Lost the terminal a server was running in (`EADDRINUSE` on 3001) | `docker compose restart node` |
| See what the node container is doing | `docker compose logs -f node` (Ctrl+C stops watching, not the container) |
| Open a shell inside the node container | `docker compose exec node sh` (`exit` to leave) |
| Run every follow-along query at once (instructor check, noisy) | PowerShell: `Get-Content nodejs\week04\class2\queries.mongodb.js \| docker compose exec -T mongo mongosh inet` |
| `inet.sales` missing or empty | `docker compose down -v` then `docker compose up -d` (**also resets MySQL**) |

## Files

```
week04/
├── class1/
│   ├── 00_js_refresher.js            script   JS refresher
│   ├── example0_rock_paper_scissors.js server  Example 0, numbered console.logs
│   ├── activity0/roll_the_dice.js    server   Activity 0 starter
│   ├── 01-06_*.js                    server   http -> Express
│   ├── 07-09_*.js                    script   summarize JSON files
│   ├── activity1/my_server.js        server   Activity 1 starter
│   ├── index.html, myfirstmodule.js           used by 04 and 05
│   └── _solution/                             Activity 0 + 1 answer keys
├── class2/
│   ├── queries.mongodb.js                     follow-along queries (Compass / VS Code Playground)
│   ├── 01-03_mongo_*.js              script   connect, find, aggregate
│   ├── 04_express_mongo.js           server   Express + MongoDB
│   ├── activity3/sales_page.js       server   Activity 3 starter (Node version of www/index.php)
│   ├── compass_queries.md                     the follow-along queries, typed into the Compass GUI
│   └── _solution/                             Activity 2 + 3 answer keys
├── practice/                                  Rock Paper Scissors, hockey stats (+ _solution)
└── data/                                      users, products, orders, hockey_stats (.json)
```

The MongoDB sample data (`inet.sales`) comes from `mongo-init/sales.json` at the repo root, loaded
the first time the mongo container starts.
