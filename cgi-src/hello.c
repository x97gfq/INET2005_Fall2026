/* hello.c - a minimal CGI program */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

/* never echo raw user input into HTML */
static void escape(const char *s) {
    for (; *s; s++)
        switch (*s) {
        case '<': fputs("&lt;", stdout);   break;
        case '>': fputs("&gt;", stdout);   break;
        case '&': fputs("&amp;", stdout);  break;
        case '"': fputs("&quot;", stdout); break;
        default:  putchar(*s);
        }
}

/* print one CGI environment variable as a table row */
static void row(const char *key) {
    const char *v = getenv(key);
    printf("<tr><td>%s</td><td>", key);
    escape(v ? v : "");
    printf("</td></tr>\n");
}

int main(void) {
    char name[64] = "world";
    const char *q = getenv("QUERY_STRING");

    if (q && strncmp(q, "name=", 5) == 0) {      /* ?name=Jamie */
        size_t n = strcspn(q + 5, "&");
        if (n > 0 && n < sizeof name) {
            memcpy(name, q + 5, n);
            name[n] = '\0';
        }
    }

    printf("Content-Type: text/html\n\n");       /* header, then blank line */

    printf("<h1>Hello, ");
    escape(name);
    printf("!</h1>\n");
    printf("<p>Served by process %d</p>\n", (int)getpid());
    printf("<table border=\"1\">\n");
    row("REQUEST_METHOD");
    row("QUERY_STRING");
    row("REMOTE_ADDR");
    row("SERVER_SOFTWARE");
    printf("</table>\n");
    return 0;
}
