#!/bin/bash
# Runs ONCE, the first time the mongo container starts with an empty data volume.
# Loads sales.json into the "inet" database, "sales" collection.
# To re-run it:  docker compose down -v   then   docker compose up -d
set -e
mongoimport --db inet --collection sales --jsonArray --drop \
  --file /docker-entrypoint-initdb.d/sales.json
