# Sequence Diagram: The Authorization Code Flow

A UML sequence diagram answers one question: **who talks to whom, in what order.**
Each vertical line is a participant, time runs downwards, and the numbered arrows
are the messages between them. Yellow boxes are work a participant does on its
own, without talking to anybody.

Read this alongside `oauth_start.php` and `oauth_callback.php` — every arrow below
is a line of code in one of those two files.

> **Viewing it:** GitHub renders Mermaid automatically. In VS Code, install the
> *Markdown Preview Mermaid Support* extension and press `Ctrl+Shift+V`. Or paste
> the block into https://mermaid.live.

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant B as Browser
    participant A as Our PHP app
    participant G as Google authorization server
    participant R as Google userinfo API

    U->>B: Click "Sign in with Google"
    B->>A: GET oauth_start.php

    rect rgb(238, 240, 248)
    Note over B,G: FRONT CHANNEL — every arrow here passes through the browser
    Note over A: state = random_token()<br/>verifier = random_token()<br/>challenge = SHA-256 of verifier<br/>save both in $_SESSION
    A-->>B: 302 Redirect to Google<br/>client_id, redirect_uri, scope,<br/>state, code_challenge
    B->>G: GET /o/oauth2/v2/auth
    G->>U: Show the Google login and consent screen
    U->>G: Password, 2FA, then Allow
    G-->>B: 302 Redirect to oauth_callback.php<br/>code + state
    B->>A: GET oauth_callback.php
    end

    Note over A: hash_equals: does the returned state<br/>match the one in the session?<br/>Then clear state + verifier — single use

    rect rgb(232, 243, 236)
    Note over A,R: BACK CHANNEL — cURL, server to server.<br/>The browser never sees any of this.
    A->>G: POST /token<br/>code, client_id, client_secret,<br/>redirect_uri, code_verifier
    Note over G: Check the secret and the redirect_uri.<br/>Hash the verifier and compare it<br/>to the stored challenge.
    G-->>A: 200 access_token + id_token
    Note over A: Decode the ID token payload.<br/>Check aud, iss and exp.
    A->>R: GET /v1/userinfo<br/>Authorization: Bearer access_token
    R-->>A: 200 sub, email, name, picture
    end

    Note over A: session_regenerate_id(true)<br/>$_SESSION['google_sub'] = sub
    A-->>B: 302 Redirect to dashboard.php
    B->>A: GET dashboard.php
    A-->>B: 200 The protected page
    B->>U: "Welcome, Jamie"
```

# What To Notice

**The two shaded bands are the whole security story.** In the first band every
arrow goes through the browser, so assume anyone can read it. In the second band
our server talks to Google directly, so that is where the client secret and the
tokens live. The `code` is the only thing that crosses from one band to the
other, and on its own it is worthless.

**Our app talks to Google twice, and they are different conversations.** The POST
to `/token` proves *we* are who we say we are (client secret) and that *we*
started this flow (code verifier). The GET to `/v1/userinfo` then uses the access
token to ask a separate server for data.

**The user's password never appears on this diagram.** It is typed at message 6,
into Google, on Google's own page. Our app has no arrow anywhere near it.

**Count the redirects.** OAuth2 does not use a special protocol. It is ordinary
HTTP redirects and one ordinary POST — you already know every mechanism here.

# The Failure Paths

The diagram above shows the happy path. `oauth_callback.php` can bail out at five
points, and every one ends the same way: clear the one-time session values, flash
an error, redirect back to `login_form.php`.

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser
    participant A as Our PHP app
    participant G as Google authorization server

    B->>A: GET oauth_callback.php
    alt Google sent ?error=access_denied
        A-->>B: Redirect to login_form.php<br/>"Google returned an error"
    else state does not match the session
        A-->>B: Redirect to login_form.php<br/>"This callback is not from a login we started"
    else PKCE verifier missing — session expired
        A-->>B: Redirect to login_form.php<br/>"Your session may have expired"
    else Token exchange rejected
        A->>G: POST /token
        G-->>A: 400 invalid_grant
        A-->>B: Redirect to login_form.php<br/>"Token exchange failed"
    else ID token fails aud / iss / exp
        A-->>B: Redirect to login_form.php<br/>"ID token was issued for a different application"
    end
```

Every branch redirects rather than rendering a page, so a refresh never replays
the attempt — the same POST/Redirect/GET habit as `login_example4`. Notice that
only one branch costs a network request: the four cheap checks all run first.
