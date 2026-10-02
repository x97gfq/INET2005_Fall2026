# Class 2 Queries in MongoDB Compass

The queries from `queries.mongodb.js` and the `01`–`04` Node scripts, written as you'd type them into the **MongoDB Compass** GUI.

## Getting connected

1. Start the containers: `docker compose up -d`
2. Open Compass → **New connection** → URI `mongodb://localhost:27017` → **Connect**
3. In the left sidebar, expand **inet** and click **sales**

Compass gives you three places to run queries:

| Where | Use it for | How |
|---|---|---|
| **Documents** tab | `find()` queries | Type into the **Filter** bar. Click **Options** for **Project**, **Sort** and **Limit** |
| **Aggregations** tab | `aggregate()` pipelines | Add one stage at a time, or switch the toggle to **Text** and paste the whole pipeline |
| **>_ MONGOSH** panel (bottom of the window) | Anything, typed exactly as in `queries.mongodb.js` | Run `use inet` first, then paste one query at a time |

> In the Filter, Project and Sort boxes you type only the `{ ... }` object, without `db.sales.find(...)` around it.

---

## Part 1: Looking around (from `01_mongo_connect.js`)

| What | In Compass |
|---|---|
| List databases | Left sidebar (or `show dbs` in mongosh) |
| List collections in `inet` | Expand **inet** in the sidebar (or `show collections`) |
| Count documents in `sales` | Shown at the top of the **Documents** tab (or `db.sales.countDocuments()`) |
| Look at one whole document | **Documents** tab → expand any document, or set **Limit** to `1` (or `db.sales.findOne()`) |

Expand a document and look for the nested **`customer`** object and the **`items`** array. Most of the queries below reach inside them.

---

## Part 2: `find()` queries (Documents tab)

### 1. All sales

**Filter:**
```js
{}
```
An empty filter matches everything. Compass shows 20 documents per page.

### 2. Sales from one store

**Filter:**
```js
{ storeLocation: 'Halifax' }
```
SQL: `SELECT * FROM sales WHERE storeLocation = 'Halifax'`

### 3. Sales where some item has quantity greater than 8

**Filter:**
```js
{ 'items.quantity': { $gt: 8 } }
```
Other comparison operators: `$gte`, `$lt`, `$lte`, `$ne`, `$in`

### 4. Sales that include a specific item

**Filter:**
```js
{ 'items.name': 'notebook' }
```
Dot notation searches inside the array. It matches if **any** item has that name. Try `'laptop'` too.

### 5. Sales within a date range (all of 2025)

**Filter:**
```js
{ saleDate: { $gte: ISODate('2025-01-01'), $lt: ISODate('2026-01-01') } }
```

### 6. The 5 most recent online sales: Project, Sort and Limit (from `02_mongo_find.js`)

Click **Options** to show the extra boxes:

| Box | Value |
|---|---|
| **Filter** | `{ purchaseMethod: 'Online' }` |
| **Project** | `{ _id: 0, saleDate: 1, storeLocation: 1, 'customer.email': 1 }` |
| **Sort** | `{ saleDate: -1 }` |
| **Limit** | `5` |

`1` = include the field, `0` = hide it. In Sort, `-1` = descending (newest first).

### 7. Sales from one store, newest first (the `/api/sales?store=Truro` route in `04_express_mongo.js`)

| Box | Value |
|---|---|
| **Filter** | `{ storeLocation: 'Truro' }` |
| **Sort** | `{ saleDate: -1 }` |
| **Limit** | `10` |

---

## Part 3: Aggregation pipelines (Aggregations tab)

A pipeline is a list of stages. Each stage's output feeds the next one. In the **Aggregations** tab you can either:

- **Stage mode:** click **+ Add Stage**, pick the operator (e.g. `$group`) from the dropdown, and paste just the stage body shown under each stage below. Compass previews the output of every stage as you go.
- **Text mode:** flip the toggle to **Text** and paste the full pipeline array.

### 8. Count the sales for each store

Full pipeline (Text mode):
```js
[
  { $group: { _id: '$storeLocation', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]
```

Stage by stage:

| Stage | Body |
|---|---|
| `$group` | `{ _id: '$storeLocation', count: { $sum: 1 } }` |
| `$sort` | `{ count: -1 }` |

SQL: `SELECT storeLocation, COUNT(*) FROM sales GROUP BY storeLocation ORDER BY 2 DESC`

### 9. Total revenue for each item

```js
[
  { $unwind: '$items' },
  { $group: {
      _id: '$items.name',
      totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
  } }
]
```

| Stage | Body |
|---|---|
| `$unwind` | `'$items'` |
| `$group` | `{ _id: '$items.name', totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } }` |

`$unwind` turns one sale with 3 items into 3 documents, one per item. Look at the stage preview to see it.

### 10. Top 5 items by revenue (also units sold, from `03_mongo_aggregate.js`)

```js
[
  { $unwind: '$items' },
  { $group: {
      _id: '$items.name',
      unitsSold: { $sum: '$items.quantity' },
      totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
  } },
  { $sort: { totalSales: -1 } },
  { $limit: 5 }
]
```

| Stage | Body |
|---|---|
| `$unwind` | `'$items'` |
| `$group` | `{ _id: '$items.name', unitsSold: { $sum: '$items.quantity' }, totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } }` |
| `$sort` | `{ totalSales: -1 }` |
| `$limit` | `5` |

### 11. Average customer satisfaction per purchase method

```js
[
  { $group: { _id: '$purchaseMethod', avgSatisfaction: { $avg: '$customer.satisfaction' } } }
]
```

| Stage | Body |
|---|---|
| `$group` | `{ _id: '$purchaseMethod', avgSatisfaction: { $avg: '$customer.satisfaction' } }` |

### 12. Revenue per store (the home page in `04_express_mongo.js`)

```js
[
  { $unwind: '$items' },
  { $group: {
      _id: '$storeLocation',
      revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
  } },
  { $sort: { revenue: -1 } }
]
```

| Stage | Body |
|---|---|
| `$unwind` | `'$items'` |
| `$group` | `{ _id: '$storeLocation', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } }` |
| `$sort` | `{ revenue: -1 }` |

---

## Quick reference: Compass vs mongosh vs Node

| Compass box | mongosh / Node |
|---|---|
| Filter `{ storeLocation: 'Halifax' }` | `db.sales.find({ storeLocation: 'Halifax' })` |
| Project `{ _id: 0, saleDate: 1 }` | `.find({}, { _id: 0, saleDate: 1 })` / Node: `.project({...})` |
| Sort `{ saleDate: -1 }` | `.sort({ saleDate: -1 })` |
| Limit `5` | `.limit(5)` |
| Aggregations tab pipeline | `db.sales.aggregate([ ... ])` |
| `ISODate('2025-01-01')` | Node: `new Date('2025-01-01')` |

**Tip:** in both the Documents and Aggregations tabs, the **`</>`** (Export to Language) button converts your query into Node.js code, so you can check it against the `02`–`04` scripts.
