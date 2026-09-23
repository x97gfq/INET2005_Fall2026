# Logging In Without Ever Seeing a Password (OAuth2 + Google)

In `login_example4` this app stored usernames and password hashes itself. That
means **we** are responsible for those passwords: hashing them properly, keeping
them out of logs, and answering for them when the database leaks.

OAuth2 moves that job somewhere else. The user proves who they are **to Google**,
and Google tells us the result. This app never sees a password.

Two diagrams of the flow live next to this file:

- [`sequence_diagram.md`](sequence_diagram.md) — who talks to whom, in what order
- [`activity_diagram.md`](activity_diagram.md) — what the code decides, and where it bails out

Slides for this example: `slides/oauth2_google_login.pptx`

# The Flow

```text
1. Browser --> login_form.php        "Sign in with Google" button
2. Browser --> oauth_start.php       we build a URL and redirect
3. Browser --> Google                user logs in and approves (on GOOGLE's site)
4. Browser --> oauth_callback.php    Google redirects back with ?code=...&state=...
5. Our server --> Google token endpoint     (back channel: code + secret --> tokens)
6. Our server --> Google userinfo endpoint  (back channel: access token --> profile)
7. Browser --> dashboard.php         our own PHP session, same as example 4
```

Steps 5 and 6 are the important ones. They are **server-to-server** requests
made with cURL, exactly the technique from the `server_side_http` examples. The
browser never sees them, which is why it is safe to send the client secret there.

Four roles in OAuth2 vocabulary:

| Role | Who that is here |
| --- | --- |
| Resource owner | The user, the person who owns the Google account |
| Client | This PHP app |
| Authorization server | Google (`accounts.google.com`) |
| Resource server | Google's userinfo API |

# Setting Up Your Google Credentials

You need your own client ID and secret. It is free, takes about five minutes,
and no billing account is required.

1. Go to **https://console.cloud.google.com/** and sign in.
2. Create a project (top bar, project dropdown, **New Project**). Name it
   anything, e.g. `inet2005-oauth-demo`.
3. In the left menu open **APIs & Services > OAuth consent screen**.
   - User type: **External**
   - Fill in the app name and your email for both support and developer contact.
   - Under **Audience**, while the app is in *Testing*, add your own Google
     account as a **Test user**. Only test users can sign in until the app is
     published, which is fine for class.
   - Scopes: leave the defaults. `openid`, `email` and `profile` are granted
     without any review process.
4. Open **APIs & Services > Credentials > Create Credentials > OAuth client ID**.
   - Application type: **Web application**
   - Authorized redirect URIs, **Add URI**, paste exactly:

     ```text
     http://localhost/login_example_oauth2/oauth_callback.php
     ```

     Google normally requires HTTPS, but makes an exception for `localhost`,
     which is why this works with no certificate. The match must be exact: a
     trailing slash, or `127.0.0.1` instead of `localhost`, will be rejected.
5. Copy the **Client ID** and **Client secret**.
6. In this folder:

   ```bash
   cp config.local.php.example config.local.php
   ```

   Paste your two values into `config.local.php`. That file is listed in
   `.gitignore`, so your secret stays off GitHub.

Then start the stack from the repo root:

```bash
docker compose up -d --build
```

and open http://localhost/login_example_oauth2/login_form.php

# The Files

| File | What it does |
| --- | --- |
| `config.php` | Client ID/secret, redirect URI, Google's endpoint URLs, the scopes we ask for. |
| `config.local.php` | **Your** credentials. Not committed. Create it from the `.example` file. |
| `helpers.php` | cURL wrappers, base64url encoding, random token generation, and a JWT payload reader. |
| `login_form.php` | The sign-in page. Note that it has no password field at all. |
| `oauth_start.php` | Step 2: generates `state` and PKCE values, then redirects to Google. Renders nothing. |
| `oauth_callback.php` | Steps 4-6: checks `state`, trades the code for tokens, reads the ID token, starts our session. |
| `dashboard.php` | The protected page. Shows the claims Google sent back. |
| `logout.php` | Destroys our session (not the Google one). |
| `sequence_diagram.md` | UML sequence diagram of the flow, plus the five failure paths. |
| `activity_diagram.md` | UML activity diagrams: the flow end to end, and the six checks in the callback. |

# Key Ideas

## Two channels

| | Front channel | Back channel |
| --- | --- | --- |
| Travels through | The user's browser (redirects) | Our server, via cURL |
| Visible to the user | Yes, it is in the address bar | No |
| Carries | client ID, scopes, `state`, the authorization code | client secret, access token, ID token |

The authorization code travels through the browser, so it is treated as
*possibly seen by someone else*. That is why a code is useless on its own:
cashing it in also needs the client secret and the PKCE verifier, and only our
server has those.

## `state` stops CSRF

We generate a random value, stash it in the session, and send a copy to Google.
Google hands it back. If the returned value does not match the one in the
session, someone else started this flow, so we reject it. Without that check an
attacker could send you a callback URL containing *their* authorization code and
quietly log you into *their* account.

## PKCE stops code interception

We invent a random `code_verifier`, send only its SHA-256 hash
(`code_challenge`) to Google, and must produce the original verifier when we
redeem the code. Someone who steals the code out of the redirect URL still
cannot use it.

PKCE was designed for mobile apps, which cannot keep a secret. It is now
recommended for every OAuth2 client, including server-side ones like this.

## Access token vs ID token

Two different tokens come back, and they get mixed up constantly:

- **Access token** - a key. It proves you are *allowed to call an API*. You send
  it in an `Authorization: Bearer ...` header. It is opaque; you are not meant to
  read it.
- **ID token** - a statement. A signed JWT that says *who the user is*. You read
  its claims. This is the OpenID Connect layer sitting on top of OAuth2.

Rule of thumb: **OAuth2 is authorization, OpenID Connect is authentication.**
Plain OAuth2 gives you permission to fetch data; the `openid` scope is what turns
it into a real login.

## What a JWT actually is

Three base64url chunks joined by dots:

```text
eyJhbGciOiJSUzI1NiIs...  .  eyJpc3MiOiJodHRwczovL2Fj...  .  XnQ2rF9...
      header                          payload                signature
```

The payload is **not encrypted**. Anyone can decode it: paste one into
https://jwt.io and look. The signature is what makes it trustworthy. We read the
payload without checking the signature in `helpers.php`, which is allowed *only*
because the token came straight from Google's token endpoint over verified
HTTPS. An ID token that arrives any other way must have its signature checked
against Google's public keys first.

## Store `sub`, not the email

The `sub` claim is Google's permanent unique ID for that account. Email addresses
change; `sub` does not. In a real app, `sub` is the column you put a unique index
on and match against when the user comes back.

## What did *not* change

Look at `dashboard.php` and the session code at the bottom of
`oauth_callback.php`. The guard clause, `session_regenerate_id(true)`, the flash
messages and the POST/Redirect/GET habit are all identical to `login_example4`.
OAuth2 replaced only the *"is this really them?"* step. Keeping them logged in
afterwards is still your job.

# Things To Try

1. **Break the state check.** In `oauth_start.php`, comment out the line that
   saves `$_SESSION['oauth_state']`. What error do you get, and which check
   caught it?
2. **Break the redirect URI.** Add a trailing slash to `GOOGLE_REDIRECT_URI` in
   `config.php`. Google now refuses before you ever type a password. Read its
   error page carefully.
3. **Watch the redirects.** Open DevTools > Network, tick *Preserve log*, and
   sign in. Find the request to `accounts.google.com` and the redirect back to
   `oauth_callback.php`. Can you see the authorization code in a URL? Can you see
   the access token anywhere? (You should see the first and not the second.)
4. **Decode the ID token yourself.** Print the raw `$idToken` in
   `oauth_callback.php`, paste it into https://jwt.io, and compare the payload
   with the table on the dashboard.
5. **Add a scope.** Add a Google API scope (Calendar, Drive) to `GOOGLE_SCOPES`
   and sign in again. What changes on Google's consent screen?
6. **Persist the user.** Add a `users` table with a `google_sub` column, and
   insert-or-update the user on every login so the app keeps its own record of
   them.
