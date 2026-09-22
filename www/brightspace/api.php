<?php
/**
 * /brightspace/api.php?ics_url=...
 *
 * Fetches a Brightspace personal calendar (ICS) feed server-side and
 * returns its due-date-like events as JSON. Must run server-side because
 * Brightspace does not send CORS headers, so a browser can't fetch the
 * feed directly with JavaScript.
 */

declare(strict_types=1);

require_once __DIR__ . '/includes/IcsParser.php';

header('Content-Type: application/json; charset=utf-8');

// Only allow fetching from Brightspace-hosted calendar feeds, so this
// endpoint can't be used as an open URL-fetch proxy (SSRF guard).
const ALLOWED_HOST_SUFFIXES = ['.brightspace.com'];

// Only show items that fall within the current academic year. Adjust these
// two dates each year (or wire them up to a config file / env var if this
// needs to roll over automatically).
const ACADEMIC_YEAR_START = '2026-09-01T00:00:00';
const ACADEMIC_YEAR_END = '2027-08-31T23:59:59';

function toTimestamp(?string $iso): ?int
{
    if ($iso === null || $iso === '') {
        return null;
    }
    try {
        // If $iso carries its own offset (e.g. "...+00:00"), DateTime uses
        // that offset regardless of the DateTimeZone passed here; a
        // "floating" value with no offset (all-day dates, local times) is
        // treated as UTC, which keeps every date on one consistent clock
        // for comparison purposes.
        return (new DateTime($iso, new DateTimeZone('UTC')))->getTimestamp();
    } catch (Exception) {
        return null;
    }
}

/** Keeps an event if it overlaps the academic-year window at all, using
 * DTSTART and (when present) DTEND — a multi-day event that starts before
 * the window but ends inside it (or vice versa) should still show up. */
function isWithinAcademicYear(array $event, int $rangeStart, int $rangeEnd): bool
{
    $start = toTimestamp($event['start'] ?? null);
    if ($start === null) {
        return false;
    }
    $end = toTimestamp($event['end'] ?? null) ?? $start;

    return $start <= $rangeEnd && $end >= $rangeStart;
}

function isAllowedIcsUrl(string $url): bool
{
    $parts = parse_url($url);
    if ($parts === false || !isset($parts['scheme'], $parts['host'])) {
        return false;
    }
    if (!in_array($parts['scheme'], ['http', 'https'], true)) {
        return false;
    }
    $host = strtolower($parts['host']);
    foreach (ALLOWED_HOST_SUFFIXES as $suffix) {
        if (str_ends_with($host, $suffix)) {
            return true;
        }
    }
    return false;
}

function respondError(int $status, string $message): never
{
    http_response_code($status);
    echo json_encode(['error' => $message]);
    exit;
}

$icsUrl = trim((string)($_GET['ics_url'] ?? ''));

if ($icsUrl === '') {
    respondError(400, 'Missing ics_url');
}

if (!isAllowedIcsUrl($icsUrl)) {
    respondError(400, "That doesn't look like a brightspace.com calendar URL.");
}

$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => "User-Agent: brightspace-deadline-timeline/1.0\r\n",
        'timeout' => 15,
        'ignore_errors' => true,
    ],
]);

$body = @file_get_contents($icsUrl, false, $context);

$statusLine = $http_response_header[0] ?? '';
$statusCode = 0;
if (preg_match('#^HTTP/\S+\s+(\d+)#', $statusLine, $m) === 1) {
    $statusCode = (int)$m[1];
}

if ($body === false) {
    respondError(502, 'Could not fetch calendar feed (no response).');
}
if ($statusCode !== 0 && ($statusCode < 200 || $statusCode >= 300)) {
    respondError(502, "Could not fetch calendar feed (HTTP {$statusCode}).");
}

try {
    $events = IcsParser::parse($body);
} catch (Throwable $e) {
    respondError(500, 'Could not parse calendar feed.');
}

$rangeStart = toTimestamp(ACADEMIC_YEAR_START);
$rangeEnd = toTimestamp(ACADEMIC_YEAR_END);
$events = array_values(array_filter(
    $events,
    static fn(array $e) => isWithinAcademicYear($e, $rangeStart, $rangeEnd)
));

echo json_encode([
    'count' => count($events),
    'items' => $events,
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
