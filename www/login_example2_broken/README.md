# login_example2_broken — SQL Injection demo

**Intentionally insecure.** This is the "before" to `login_example2`'s "after".
Never write authentication code like this.

## What's wrong with it

`process_login.php` builds its SQL query by gluing the submitted username and
password straight into the string:

```php
$sql = "SELECT username FROM users_plaintext "
     . "WHERE username = '" . $username . "' "
     . "AND password = '" . $password . "'";
```

Because the user's input becomes part of the query, an attacker can rewrite what
the query *does*. On top of that, this demo stores passwords in **plaintext**
(table `users_plaintext`) so the password can be checked inside the SQL — a
second bad practice that makes the bypass simple.

## Valid logins (for the "normal" case)

| Username | Password    |
|----------|-------------|
| jsmith   | password123 |
| agreen   | letmein     |
| bwayne   | batcave     |

## Injection payloads to try in class

**1. Log in with no valid password** — type this as the **Username**, leave the
password blank (or anything):

```
' OR '1'='1' -- 
```

The `--` (note the trailing space) comments out the rest of the query, so it
becomes `... WHERE username = '' OR '1'='1' -- ...` which is always true and
returns the first row.

**2. Log in as a specific known user** — Username:

```
bwayne' -- 
```

The password check is commented out, so you're logged in as `bwayne` without
knowing the password.

## The fix

See `../login_example2/process_login.php`: a **prepared statement with a bound
parameter** keeps user input out of the SQL string, and **bcrypt hashing**
(`password_hash` / `password_verify`) means the password is never compared in
SQL and never stored in plaintext.

## Setup note

This example needs the `users_plaintext` table from
`initdb/03_login_demo_broken.sql`. MySQL only runs the `initdb/*.sql` scripts on
a **fresh** data volume, so if your containers are already up the table won't
exist yet. Rather than wiping the volume, run the script straight against the
running database container (`inet-lamp-db`).

Make sure the stack is running first (`docker compose up -d`), then from the
project root:

**Windows (PowerShell):**

```powershell
Get-Content .\initdb\03_login_demo_broken.sql | docker exec -i inet-lamp-db mysql -uroot -prootpassword
```

**macOS / Linux (bash):**

```bash
docker exec -i inet-lamp-db mysql -uroot -prootpassword < ./initdb/03_login_demo_broken.sql
```

Both do the same thing: read the `.sql` file and feed it to the `mysql` client
inside the container on standard input. The `-i` flag keeps stdin open so the
piped file reaches `mysql`. (You can ignore the "Using a password on the command
line interface can be insecure" warning — it's fine for local dev.)

To confirm the table was created:

```bash
docker exec -i inet-lamp-db mysql -uroot -prootpassword -e "SELECT * FROM login_demo.users_plaintext;"
```

### Alternative: recreate the volume

If you'd rather have all `initdb` scripts run automatically from scratch (this
**deletes** the current database data):

```bash
docker compose down -v
docker compose up -d --build
```
