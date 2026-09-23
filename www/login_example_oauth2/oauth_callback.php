<?php
// STEP 2 and 3 of the Authorization Code flow.
//
// Google sends the user's browser back here with ?code=...&state=...
// This page verifies the state, trades the code for tokens (server-to-server),
// looks up who the user is, and starts our own session.
session_start();
require __DIR__ . '/config.php';
require __DIR__ . '/helpers.php';

// Helper: any failure sends the user back to the login form with a message,
// exactly like process_login.php in login_example4.
function fail(string $message): void
{
    // The one-time values are no good after a failed attempt - throw them away
    // so a stale state or verifier cannot be reused.
    unset($_SESSION['oauth_state'], $_SESSION['oauth_code_verifier']);
    $_SESSION['flash_errors'] = [$message];
    header('Location: login_form.php');
    exit;
}

// --- The user may have declined ---
// If they click "Cancel" on Google's consent screen, we get ?error=access_denied
if (isset($_GET['error'])) {
    fail('Google returned an error: ' . $_GET['error']);
}

$code  = $_GET['code']  ?? '';
$state = $_GET['state'] ?? '';

if ($code === '' || $state === '') {
    fail('Missing code or state in the callback. Start at the login page.');
}

// --- Verify state ---
// hash_equals() compares in constant time, so an attacker cannot learn the
// value by timing how long the comparison takes.
$expectedState = $_SESSION['oauth_state'] ?? '';
if ($expectedState === '' || !hash_equals($expectedState, $state)) {
    fail('State mismatch - this callback did not come from a login we started.');
}

$codeVerifier = $_SESSION['oauth_code_verifier'] ?? '';
if ($codeVerifier === '') {
    fail('Missing PKCE verifier - your session may have expired. Try again.');
}

// state and the verifier are single-use. Clear them now so a replayed
// callback URL cannot be used a second time.
unset($_SESSION['oauth_state'], $_SESSION['oauth_code_verifier']);

// --- Exchange the code for tokens ---
// This POST happens from OUR SERVER to Google, not from the browser. It is
// the only request that carries the client secret, and the tokens that come
// back never pass through the user's browser at all.
$token = http_post_form(GOOGLE_TOKEN_URL, [
    'code'          => $code,
    'client_id'     => GOOGLE_CLIENT_ID,
    'client_secret' => GOOGLE_CLIENT_SECRET,
    'redirect_uri'  => GOOGLE_REDIRECT_URI,   // must match step 1 - Google checks
    'grant_type'    => 'authorization_code',
    'code_verifier' => $codeVerifier,         // proves we started this flow (PKCE)
]);

if (!$token['ok']) {
    fail('Token exchange failed: ' . $token['error']);
}

$accessToken = $token['data']['access_token'] ?? null;   // used to CALL Google APIs
$idToken     = $token['data']['id_token']     ?? null;   // a JWT that DESCRIBES the user

if (!$accessToken || !$idToken) {
    fail('Google did not return the expected tokens.');
}

// --- Read the ID token ---
// The ID token is the OpenID Connect part: a signed JWT containing claims
// about the user (sub, email, name, ...). See the note in helpers.php about
// why we can read it here without verifying the signature ourselves.
$claims = jwt_decode_payload($idToken);
if ($claims === null) {
    fail('Could not read the ID token.');
}

// Sanity-check the claims. A real library does this for you; doing it by hand
// once makes it obvious what is being checked.
$now = time();
if (($claims['aud'] ?? '') !== GOOGLE_CLIENT_ID) {
    fail('ID token was issued for a different application.');   // not meant for us
}
if (!in_array($claims['iss'] ?? '', ['https://accounts.google.com', 'accounts.google.com'], true)) {
    fail('ID token did not come from Google.');
}
if (($claims['exp'] ?? 0) < $now) {
    fail('ID token has expired.');
}

// --- Call an API with the access token ---
// We already have the user's details in the ID token, so this call is not
// strictly necessary. It is here because calling a protected API with a
// Bearer token is the thing you will do with every other OAuth2 provider.
$userinfo = http_get_with_token(GOOGLE_USERINFO_URL, $accessToken);
$profile  = $userinfo['ok'] ? $userinfo['data'] : $claims;   // fall back to the token's claims

// --- Start OUR session ---
// From here on this works like any other logged-in session. OAuth2 answered
// "who is this person"; keeping them logged in is still our job.
session_regenerate_id(true);   // prevents session fixation, same as login_example4

// 'sub' (subject) is Google's permanent unique ID for this user. In a real app
// this is the value you store in your users table - NOT the email address,
// which a user can change.
$_SESSION['google_sub']     = $claims['sub'];
$_SESSION['email']          = $profile['email']          ?? null;
$_SESSION['email_verified'] = $profile['email_verified'] ?? false;
$_SESSION['name']           = $profile['name']           ?? 'Google user';
$_SESSION['picture']        = $profile['picture']        ?? null;
$_SESSION['login_time']     = $now;

// Kept only so the dashboard can show students what came back. A real app
// would never put raw tokens in the session unless it needed to call more APIs.
$_SESSION['demo_id_token_claims'] = $claims;
$_SESSION['demo_token_response']  = array_merge($token['data'], [
    'access_token' => substr($accessToken, 0, 12) . '...(truncated)',
    'id_token'     => substr($idToken, 0, 12) . '...(truncated)',
]);

header('Location: dashboard.php');
exit;
