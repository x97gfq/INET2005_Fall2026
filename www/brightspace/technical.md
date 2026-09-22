# Technical notes (Deadline Timeline)

Written for teaching purposes — this covers the architecture, the design
decisions, and where the interesting classroom discussion points are.

## Architecture

```
brightspace/
  index.php            HTML shell, pulls in assets/style.css and assets/app.js
  api.php               JSON endpoint: fetches + parses a Brightspace ICS feed
  includes/IcsParser.php  Pure parsing logic, no I/O, unit-testable in isolation
  assets/style.css
  assets/app.js         All client-side rendering; talks to api.php via fetch()
```

Classic three-tier split: `IcsParser` is pure logic (no `$_GET`, no network,
no `echo`) so it can be tested by calling `IcsParser::parse($string)`
directly; `api.php` is the thin HTTP layer around it (read input, call the
parser, write JSON); `index.php` + `app.js` is the presentation layer that
only ever talks JSON to `api.php`, never touching Brightspace directly.

## Why the browser can't just fetch the ICS URL itself

This is the single most useful thing to walk students through. Try
`fetch()`-ing a Brightspace calendar URL directly from `app.js` and it
fails — not because the URL is wrong, but because of the browser's
same-origin policy: a page served from your domain isn't allowed to read
the *response* of a cross-origin request unless the other server opts in
with `Access-Control-Allow-Origin` headers, and Brightspace doesn't send
those for this feed. `api.php` sits on the same origin as `index.php`, and
it does the cross-origin fetch **server-to-server** using
`file_get_contents()` with a stream context — server-to-server requests
aren't subject to CORS at all, only browser JavaScript is. This is the
textbook "backend proxy" pattern for exactly this situation.

## The SSRF guard in `api.php`

`isAllowedIcsUrl()` restricts fetches to hostnames ending in
`.brightspace.com`. Without it, `api.php` is a generic URL-fetching proxy:
anyone could call `api.php?ics_url=http://internal-server/admin` and use
your server as a relay to probe internal network addresses, or to fetch
arbitrary external URLs while spoofing your server's IP as the source.
This class of bug is called **Server-Side Request Forgery (SSRF)** and is
a real OWASP-listed risk any time user input becomes part of a server-side
fetch. Good discussion prompt: what happens if you allow any host whose
name merely *contains* `brightspace.com` rather than checking it as a
proper suffix of the parsed hostname? (Answer: `evil.com/?x=brightspace.com`
or a subdomain trick like `brightspace.com.evil.com` would slip through if
you used `str_contains()` instead of checking `$host` — which is exactly
why `parse_url()` + a suffix check on the actual `host` component matters,
not a naive string search on the whole URL.)

## ICS parsing, by hand

`IcsParser` doesn't use a library — it implements just enough of
[RFC 5545](https://www.rfc-editor.org/rfc/rfc5545) to be useful:

- **Line unfolding**: ICS allows a long line to be split across multiple
  physical lines, where every continuation line starts with a space or
  tab. `unfoldLines()` has to reassemble these before anything else can
  work, or a single folded `SUMMARY` gets silently truncated.
- **Property lines**: `NAME;PARAM=VALUE;PARAM2=VALUE2:actual value` — the
  parser splits on the *first* colon only, because the value itself can
  contain colons (e.g. a URL or a time). `parsePropertyLine()` shows this.
- **Two date formats**: an all-day event uses `DTSTART;VALUE=DATE:20260930`
  (just a date, no time — a due date "sometime that day"); a timed event
  uses `DTSTART:20260925T235900Z` (date + time + `Z` for UTC) or, less
  often, a floating local time with no `Z`. `parseDateTime()` distinguishes
  these and normalizes both to ISO-8601 for the frontend.
- **Text escaping**: ICS escapes literal commas, semicolons, and newlines
  in free-text fields (`\,` `\;` `\n`) because those characters are
  meaningful in the format itself. `unescapeText()` undoes that.

This is a good "read a spec and implement 5% of it" exercise — the full
RFC is much larger (recurring events via `RRULE`, time zones via `VTIMEZONE`,
alarms via `VALARM`, and more), and deliberately none of that is handled
here, because Brightspace's feed doesn't need it for this use case. Worth
asking students: what would break if an instructor scheduled a *recurring*
event with a due date? (Answer: this parser would only ever see the first
occurrence, since `RRULE` expansion isn't implemented.)

## `guessCourse()` and why it's a heuristic, not a guarantee

The ICS `CATEGORIES` property is the "correct" place for a course label,
and it's used when present. But Brightspace's own feed doesn't reliably
populate it, so there's a fallback: pattern-match a course-code prefix out
of the event title, e.g. `"PROG2700 - Assignment 3"` → `PROG2700`. This is
inherently fragile — it assumes instructors name things consistently. If
your institution's feed formats titles differently, this is the function
to change. Worth having students **actually load a real feed** and check
whether `guessCourse()` gets it right before trusting it for real use.

## Testing without touching a real Brightspace account

Because `IcsParser::parse()` is pure (string in, array out), it can be unit
tested with a static fixture file instead of hitting Brightspace:

```php
$text = file_get_contents('sample.ics');
$events = IcsParser::parse($text);
// assert on $events
```

A `sample.ics` with a timed event, an all-day event, and a `CATEGORIES`
event (covering all three branches of `guessCourse()`) is enough to catch
regressions. No PHPUnit is wired up in this repo — adding it is a
reasonable extension exercise.

## Known limitations / good extension exercises

- **No caching**: every page load re-fetches the entire ICS feed from
  Brightspace. Fine for one student clicking a button; would need
  server-side caching (e.g. keyed by a hash of the URL, TTL'd a few
  minutes) if this were used at scale.
- **No persistence**: the calendar URL isn't saved anywhere, so students
  re-paste it every visit. A "remember this on my device" feature would
  need client-side storage (`localStorage`) — deliberately *not* server-side
  storage, since a calendar URL is sensitive per-student data and storing
  it server-side raises real privacy/security questions worth discussing.
- **No rate limiting**: `api.php` will happily be hammered. A simple
  extension: track requests per IP in a session or a lightweight
  file/DB-backed counter.
- **HTML injection**: check `escapeHtml()` in `app.js` — it deliberately
  builds text nodes via `textContent` rather than concatenating strings
  into `innerHTML`, to avoid a stored/reflected XSS if a course or
  assignment title ever contained HTML-special characters. Good to point
  out as the client-side counterpart to server-side input validation.

## Path to a "real" API integration (not implemented here)

This tool deliberately avoids Brightspace's full **Valence Learning
Framework API** (the official REST API, with per-tool endpoints for
Dropbox/Quizzes/Content and OAuth 2.0 login) because that requires an
institutional admin to register an OAuth application (client ID, secret,
redirect URI) under **Org Unit Extensibility** in the Brightspace admin
console — a real dependency on IT approval that the ICS-feed approach
sidesteps entirely. If that access becomes available, a natural v2 project
is swapping `api.php`'s ICS fetch for authenticated Valence API calls,
which would also allow true per-student login instead of a pasted URL.
