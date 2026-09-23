# Activity Diagram: What the Code Decides

Where the sequence diagram shows *who talks to whom*, a UML activity diagram
shows *what gets decided*. Diamonds are decisions, rectangles are actions, and
the rounded boxes at the top and bottom are the start and end of the activity.

Colour tells you who is doing the work: **blue** is our PHP app, **green** is
Google, **grey** is the user, **red** is the failure path.

> **Viewing it:** GitHub renders Mermaid automatically. In VS Code, install the
> *Markdown Preview Mermaid Support* extension and press `Ctrl+Shift+V`. Or paste
> the block into https://mermaid.live.

# The Whole Activity, End To End

```mermaid
flowchart TD
    start(["User clicks<br/>Sign in with Google"]) --> gen["oauth_start.php<br/>generate state<br/>and code_verifier,<br/>save both in the session"]
    gen --> build["Redirect to Google with<br/>scope, state, challenge"]
    build --> authorize["Google authenticates<br/>the user and returns<br/>an authorization code"]
    authorize --> checks["oauth_callback.php<br/>validate the callback<br/>(next diagram)"]
    checks --> post["POST to the token endpoint<br/>with the secret<br/>and the verifier"]
    post --> verify["Google verifies both<br/>and returns the tokens"]
    verify --> decode["Decode the ID token,<br/>check aud, iss, exp"]
    decode --> userinfo["GET userinfo with<br/>the access token"]
    userinfo --> session["session_regenerate_id,<br/>store sub and email"]
    session --> done(["Dashboard: signed in"])

    classDef ours fill:#EEF0F8,stroke:#4F5B93,stroke-width:2px,color:#232531
    classDef goog fill:#E8F3EC,stroke:#3F7D58,stroke-width:2px,color:#232531
    classDef usr fill:#F2F2F4,stroke:#6B6F80,stroke-width:2px,color:#232531

    class gen,build,checks,post,decode,userinfo,session ours
    class authorize,verify goog
    class start,done usr
```

Only two activities on that diagram belong to Google. Everything else is ours —
including, as the next diagram shows, all of the checking.

# The Validation Inside oauth_callback.php

The box marked *validate the callback* hides six decisions. Here they are, in the
order the code runs them.

```mermaid
flowchart TD
    arrive(["Google redirects to<br/>oauth_callback.php"]) --> haserr{"Did Google<br/>send an error?"}
    haserr -- "yes: access_denied" --> fail
    haserr -- no --> hasboth{"Are code and state<br/>both present?"}
    hasboth -- no --> fail
    hasboth -- yes --> statematch{"Does state match<br/>the session?"}
    statematch -- no --> fail
    statematch -- yes --> hasverifier{"Is the PKCE<br/>verifier still there?"}
    hasverifier -- no --> fail
    hasverifier -- yes --> clear["Clear state and verifier<br/>— both are single use"]
    clear --> post["POST to the token endpoint"]
    post --> tokok{"Did the exchange<br/>succeed?"}
    tokok -- no --> fail
    tokok -- yes --> claimsok{"Are aud, iss and exp<br/>all valid?"}
    claimsok -- no --> fail
    claimsok -- yes --> ok(["Start our session,<br/>go to the dashboard"])
    fail["Clear the one-time values,<br/>flash the message,<br/>redirect to login_form.php"] --> again(["Login form:<br/>error shown"])

    classDef ours fill:#EEF0F8,stroke:#4F5B93,stroke-width:2px,color:#232531
    classDef usr fill:#F2F2F4,stroke:#6B6F80,stroke-width:2px,color:#232531
    classDef bad fill:#FBEBEC,stroke:#B3404A,stroke-width:2px,color:#232531

    class haserr,hasboth,statematch,hasverifier,clear,post,tokok,claimsok ours
    class arrive,ok,again usr
    class fail bad
```

# What To Notice

**Six decisions, one exit.** Every failure funnels into the same activity: clear
the one-time values, flash a message, redirect. That is the `fail()` helper at
the top of `oauth_callback.php`. Writing it once is what keeps the checks below
it short enough to read.

**The order of the checks is deliberate.** The cheap, local checks run first —
did Google send an error, are the parameters present, does `state` match, is the
verifier still in the session. Only once all four pass do we spend a network
request on the token exchange. Never pay for an expensive check before a free one
can rule the request out.

**Look at how little is green.** Google authenticates the user and verifies the
exchange. Everything else — all six decisions — is ours. Handing authentication
to Google does not hand over the validation.

**`clear` happens before `post`, not after.** The verifier and state are removed
from the session the moment they have been checked, so a replayed callback URL
fails at *"Is the PKCE verifier still there?"* the second time round.

# Compare With login_example4

The same diagram for the password version is much shorter, and that is the point:

```mermaid
flowchart TD
    start(["User submits<br/>the login form"]) --> filled{"Username and<br/>password present?"}
    filled -- no --> fail
    filled -- yes --> lookup["SELECT password_hash<br/>WHERE username = ?"]
    lookup --> verify{"Does password_verify<br/>match the hash?"}
    verify -- no --> fail
    verify -- yes --> session["session_regenerate_id,<br/>store the username"]
    session --> done(["Dashboard: signed in"])
    fail["Flash the errors,<br/>redirect to the form"] --> again(["Login form:<br/>error shown"])

    classDef ours fill:#EEF0F8,stroke:#4F5B93,stroke-width:2px,color:#232531
    classDef usr fill:#F2F2F4,stroke:#6B6F80,stroke-width:2px,color:#232531
    classDef bad fill:#FBEBEC,stroke:#B3404A,stroke-width:2px,color:#232531

    class filled,lookup,verify,session ours
    class start,done,again usr
    class fail bad
```

Fewer boxes — but notice *what* is missing rather than how many. There is no
network call, no second party and no token. What there is instead is a
`password_hash` column in our database that we have to protect. The extra
complexity in the OAuth2 diagrams is the price of not owning that column.

Notice too that the last two activities are identical in both: `session_regenerate_id`,
store who they are, go to the dashboard. That is the part OAuth2 does not change.
