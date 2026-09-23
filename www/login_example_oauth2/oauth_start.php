<?php
// STEP 1 of the Authorization Code flow.
//
// This page does not show anything. It builds a URL at Google, remembers two
// secrets in the session, and redirects the browser away to Google.
session_start();
require __DIR__ . '/config.php';
require __DIR__ . '/helpers.php';

if (!oauth_is_configured()) {
    $_SESSION['flash_errors'] = ['No client ID or secret configured. See README.md.'];
    header('Location: login_form.php');
    exit;
}

// --- state: protects against CSRF ---
// We generate a random value, keep a copy in the session, and send a copy to
// Google. Google hands the same value back on the callback. If the two do not
// match, the callback did not come from a flow that WE started, so we reject
// it. Without this, an attacker could feed you their own authorization code
// and log you into their account.
$state = random_token();
$_SESSION['oauth_state'] = $state;

// --- PKCE: protects the authorization code in transit ---
// We invent a random "code verifier", keep it in the session, and send only
// its SHA-256 hash (the "code challenge") to Google. Later, when we trade the
// code for tokens, we must present the original verifier. An attacker who
// steals the authorization code out of the redirect URL still cannot use it,
// because they never saw the verifier.
$codeVerifier  = random_token(32);
$codeChallenge = base64url_encode(hash('sha256', $codeVerifier, true));
$_SESSION['oauth_code_verifier'] = $codeVerifier;

// Everything below is public - it all travels through the user's browser.
// The client SECRET is deliberately NOT here.
$params = [
    'client_id'             => GOOGLE_CLIENT_ID,
    'redirect_uri'          => GOOGLE_REDIRECT_URI,   // must match the console exactly
    'response_type'         => 'code',                // "authorization code" flow
    'scope'                 => GOOGLE_SCOPES,
    'state'                 => $state,
    'code_challenge'        => $codeChallenge,
    'code_challenge_method' => 'S256',                // S256 = SHA-256, never use "plain"
    'access_type'           => 'online',              // we don't need offline refresh tokens here
    'prompt'                => 'select_account',      // always show the account chooser, handy in class
];

$authUrl = GOOGLE_AUTH_URL . '?' . http_build_query($params);

// Hand the browser over to Google. From here the user is on Google's site,
// typing their password into Google - not into us.
header('Location: ' . $authUrl);
exit;
