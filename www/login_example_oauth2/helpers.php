<?php
// Shared helpers for the OAuth2 example.
// Only PHP's built-in cURL and JSON functions are used - no Composer, no libraries.

// Base64 URL encoding: normal base64, but using - and _ instead of + and /,
// and with the = padding stripped. OAuth2 and JWTs use it everywhere because
// the result is safe to put in a URL.
function base64url_encode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string
{
    return base64_decode(strtr($data, '-_', '+/'));
}

// A cryptographically random string, used for both the state value and the
// PKCE code verifier. random_bytes() is the secure generator - never use
// rand() or uniqid() for anything security related.
function random_token(int $bytes = 32): string
{
    return base64url_encode(random_bytes($bytes));
}

// POST a form-encoded body and decode the JSON response.
// The token endpoint is the one place we send our client secret, so this
// request goes server-to-server over HTTPS - it never touches the browser.
function http_post_form(string $url, array $fields, int $timeout = 10): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query($fields),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => $timeout,
        CURLOPT_SSL_VERIFYPEER => true,   // never turn this off - it is what makes HTTPS trustworthy
        CURLOPT_HTTPHEADER     => ['Accept: application/json'],
    ]);

    $body   = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error  = curl_error($ch);
    curl_close($ch);

    if ($body === false) {
        return ['ok' => false, 'status' => $status, 'data' => null, 'error' => $error];
    }

    $data = json_decode($body, true);
    if ($status >= 400) {
        // OAuth2 errors come back as JSON: {"error":"invalid_grant", ...}
        $message = $data['error_description'] ?? $data['error'] ?? "Provider returned HTTP $status";
        return ['ok' => false, 'status' => $status, 'data' => $data, 'error' => $message];
    }
    return ['ok' => true, 'status' => $status, 'data' => $data, 'error' => null];
}

// GET a JSON resource using an access token.
// This is how you call ANY OAuth2-protected API: put the access token in an
// Authorization header. Google's userinfo endpoint is just one example.
function http_get_with_token(string $url, string $accessToken, int $timeout = 10): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => $timeout,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_HTTPHEADER     => [
            'Accept: application/json',
            'Authorization: Bearer ' . $accessToken,   // <- the token goes here
        ],
    ]);

    $body   = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error  = curl_error($ch);
    curl_close($ch);

    if ($body === false || $status >= 400) {
        return ['ok' => false, 'status' => $status, 'data' => null, 'error' => $error ?: "Provider returned HTTP $status"];
    }
    return ['ok' => true, 'status' => $status, 'data' => json_decode($body, true), 'error' => null];
}

// Pull the payload out of a JWT so we can look at it.
//
// A JWT is three base64url chunks joined by dots: header.payload.signature
// This function only READS the payload - it does not check the signature.
// That is safe here because we received the token directly from Google's
// token endpoint over a verified HTTPS connection (OpenID Connect allows
// skipping verification in exactly this case). If an ID token ever reaches
// you any other way - from a browser, a query string, another service - you
// MUST verify its signature against Google's public keys first.
function jwt_decode_payload(string $jwt): ?array
{
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) {
        return null;
    }
    $payload = json_decode(base64url_decode($parts[1]), true);
    return is_array($payload) ? $payload : null;
}
