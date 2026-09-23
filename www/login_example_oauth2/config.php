<?php
// Where your Google credentials live.
//
// config.local.php is ignored by git so your client secret never ends up in a
// public repo. Copy config.local.php.example to config.local.php and fill in
// the two values you get from the Google Cloud Console (see README.md).
$localConfig = __DIR__ . '/config.local.php';
$google = is_file($localConfig) ? require $localConfig : ['client_id' => '', 'client_secret' => ''];

// The redirect URI must match EXACTLY what you registered in the Google Cloud
// Console - same scheme, host, port and path. "http://localhost/..." is fine;
// Google makes an exception to its HTTPS rule for localhost.
define('GOOGLE_CLIENT_ID',     $google['client_id']);
define('GOOGLE_CLIENT_SECRET', $google['client_secret']);
define('GOOGLE_REDIRECT_URI',  'http://localhost/login_example_oauth2/oauth_callback.php');

// Google publishes these endpoints in a discovery document:
//   https://accounts.google.com/.well-known/openid-configuration
// A real app would fetch and cache that. We hard-code them so the flow stays
// readable, but open that URL once - every provider publishes the same file.
define('GOOGLE_AUTH_URL',     'https://accounts.google.com/o/oauth2/v2/auth');
define('GOOGLE_TOKEN_URL',    'https://oauth2.googleapis.com/token');
define('GOOGLE_USERINFO_URL', 'https://openidconnect.googleapis.com/v1/userinfo');

// Scopes are the permissions we ask the user for. These three are the minimum
// for "who is this person" and show no scary consent screen.
//   openid  - use OpenID Connect, i.e. give us an ID token
//   email   - the user's email address and whether it is verified
//   profile - display name and profile picture
define('GOOGLE_SCOPES', 'openid email profile');

// Have the credentials actually been filled in?
function oauth_is_configured(): bool
{
    return GOOGLE_CLIENT_ID !== '' && GOOGLE_CLIENT_SECRET !== '';
}
