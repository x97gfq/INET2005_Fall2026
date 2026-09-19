# CGI in C: How the Web Did Dynamic Pages

Before PHP, a "dynamic" web page usually meant a program written in C or Perl that the web server ran for every request. The rule book for how the server and program talk is called **CGI** (Common Gateway Interface, 1993).

This folder holds a small C program, `hello.c`, that runs as a CGI program inside our Docker LAMP stack.

# The CGI Contract

A CGI program is just a normal command-line program.

**Input** (server to program):

- Request details arrive as **environment variables**, read with `getenv()`.
  - `REQUEST_METHOD` (GET or POST)
  - `QUERY_STRING` (for example `name=Jamie`)
  - `REMOTE_ADDR`, `HTTP_USER_AGENT`, and more
- A POST body arrives on **stdin**.

**Output** (program to server) goes to **stdout**, in this order:

1. One or more header lines, for example `Content-Type: text/html`
2. A **blank line**
3. The body (the HTML)

If the blank line is missing, the server cannot tell where the headers end and you get a 500 error.

# Life of a Request

```text
Browser --GET /cgi-bin/hello.cgi?name=Jamie--> Apache (mod_cgi)
Apache  --fork() + exec(), env vars set------> hello.cgi process
hello.cgi --stdout: header, blank line, HTML-> Apache
Apache  --HTTP response----------------------> Browser
```

Every request starts a **brand new process**. The program runs, prints its output, and exits. Refresh the page and watch the process ID change.

# How It Is Set Up in Docker

Dockerfile (one added line):

```dockerfile
RUN a2enmod cgi && a2enconf serve-cgi-bin
```

`a2enmod cgi` turns on Apache's `mod_cgi`. `serve-cgi-bin` maps the URL `/cgi-bin/` to the folder `/usr/lib/cgi-bin/` inside the container.

docker-compose.yml (two added volumes on the `web` service):

```yaml
- ./cgi-bin:/usr/lib/cgi-bin    # compiled programs (Apache runs these)
- ./cgi-src:/usr/src/cgi        # C source code (we edit these)
```

| Folder on your computer | Folder inside the container | What it holds |
|-------------------------|-----------------------------|---------------|
| `cgi-src/`              | `/usr/src/cgi/`             | Source code (`hello.c`) |
| `cgi-bin/`              | `/usr/lib/cgi-bin/`         | Compiled programs |

The `cgi-bin/` folder is created automatically by Docker and is not saved in git. Only the source code is.

The web container already contains `gcc`, so you compile **inside the container**. Do not compile on Windows: a Windows program cannot run under Linux Apache.

# Build and Run

1. Start (or rebuild) the stack:

```bash
docker compose up -d --build
```

2. Compile inside the web container:

```bash
docker compose exec web gcc -Wall -o /usr/lib/cgi-bin/hello.cgi /usr/src/cgi/hello.c
```

3. Open in your browser:

- http://localhost/cgi-bin/hello.cgi
- http://localhost/cgi-bin/hello.cgi?name=Jamie

Refresh a few times and watch "Served by process" change.

After editing `hello.c`, just re-run step 2 and refresh. No restart is needed.

## Windows Note

If you use **Git Bash**, it rewrites paths that start with `/usr/...` and step 2 fails with `No such file or directory`. Either use PowerShell or Command Prompt, or run this first in Git Bash:

```bash
export MSYS_NO_PATHCONV=1
```

# What hello.c Does

The program is about 50 lines. It:

- Reads `?name=` out of `QUERY_STRING` by hand, copying it into a fixed 64-byte buffer safely
- Prints the header `Content-Type: text/html` followed by the blank line
- Prints an HTML greeting, the process ID, and a table of CGI environment variables
- Runs everything it prints through `escape()`, which rewrites `<`, `>`, `&` and `"` so user input can never inject HTML or scripts

The essence of any CGI program is this:

```c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    const char *q = getenv("QUERY_STRING");   /* INPUT: env var */

    printf("Content-Type: text/html\n\n");    /* header + BLANK LINE */

    printf("<h1>Hello from C!</h1>\n");       /* body: plain stdout */
    return 0;
}
```

## What CGI in C Does Not Give You

- URL-decoding (`%20`, `+`), form parsing, cookies, and sessions are all hand-written. `hello.c` does not decode the URL, so `?name=a%20b` prints `a%20b`.
- There are no safety nets. One bad `strcpy()` can compromise the whole server. PHP hands you `$_GET`, `$_POST` and `$_SESSION` and manages memory for you.

# Troubleshooting

The browser only says "500 Internal Server Error". The real message is in the Apache log:

```bash
docker compose logs web
```

| What the log says | Likely cause |
|-------------------|--------------|
| `malformed header from script` | Missing `Content-Type` line or missing blank line |
| `Exec format error` | The file is not a Linux program (compiled on Windows, or not compiled at all) |
| `Permission denied` | File is not executable: `chmod +x hello.cgi` |
| `script not found or unable to stat` | Typo in the URL, or the program is not compiled yet (this one is a 404, not a 500) |

# CGI vs PHP

|                | CGI program (C)              | PHP (mod_php)                    |
|----------------|------------------------------|----------------------------------|
| Process model  | New process per request      | Interpreter lives inside Apache  |
| Input          | `getenv()`, read stdin       | `$_GET`, `$_POST`, `$_SESSION`   |
| Output         | `printf()` HTML              | HTML with embedded `<?php ?>`    |
| Change a page  | Edit, recompile, redeploy    | Edit, save, refresh              |
| Memory safety  | Your problem                 | Handled for you                  |

Modern stacks still use the same idea. FastCGI and PHP-FPM keep the process alive between requests instead of starting a new one each time.

# Try It Yourself

- Change the greeting, recompile, and reload
- Print the `HTTP_USER_AGENT` header. What does your browser say about you?
- Add a second program, `time.c`, that prints the server time (`time.h`). Compile it to `/usr/lib/cgi-bin/time.cgi`
- Write an HTML form in `www/` that POSTs to a CGI program. Read `CONTENT_LENGTH` bytes from stdin
- Remove the blank line from the header, recompile, and read the error log
- Add URL-decoding (`%XX`) to `hello.c`, then remove `escape()` and try `?name=<script>alert(1)</script>`. That is a real cross-site scripting (XSS) hole. Put `escape()` back afterwards
