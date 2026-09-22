<?php
/**
 * Minimal ICS (iCalendar) parser, purpose-built for Brightspace's personal
 * "Subscribe to Calendar" feed. Not a general-purpose ICS library — just
 * enough of RFC 5545 to pull out VEVENT title/course/start time.
 */

final class IcsParser
{
    /**
     * @return array<int, array{uid: ?string, title: string, course: string,
     *   start: ?string, all_day: bool, description: string}>
     */
    public static function parse(string $rawText): array
    {
        $events = [];
        $current = null;

        foreach (self::unfoldLines($rawText) as $line) {
            $trimmed = trim($line);

            if ($trimmed === 'BEGIN:VEVENT') {
                $current = [];
                continue;
            }
            if ($trimmed === 'END:VEVENT') {
                if ($current !== null && isset($current['start'])) {
                    $events[] = self::finalizeEvent($current);
                }
                $current = null;
                continue;
            }
            if ($current === null) {
                continue;
            }

            [$name, $params, $value] = self::parsePropertyLine($line);
            if ($name === null) {
                continue;
            }

            switch ($name) {
                case 'SUMMARY':
                    $current['summary'] = self::unescapeText($value);
                    break;
                case 'DESCRIPTION':
                    $current['description'] = self::unescapeText($value);
                    break;
                case 'CATEGORIES':
                    $current['categories'] = self::unescapeText($value);
                    break;
                case 'LOCATION':
                    $current['location'] = self::unescapeText($value);
                    break;
                case 'UID':
                    $current['uid'] = $value;
                    break;
                case 'DTSTART':
                case 'DTEND':
                    $parsed = self::parseDateTime($value, $params);
                    if ($parsed !== null) {
                        [$iso, $allDay] = $parsed;
                        if ($name === 'DTSTART') {
                            $current['start'] = $iso;
                            $current['all_day'] = $allDay;
                        } else {
                            $current['end'] = $iso;
                        }
                    }
                    break;
            }
        }

        usort($events, static fn($a, $b) => ($a['start'] ?? '') <=> ($b['start'] ?? ''));

        return $events;
    }

    /** RFC 5545 line unfolding: a line starting with a space/tab continues the previous one. */
    private static function unfoldLines(string $rawText): array
    {
        $rawText = str_replace("\r\n", "\n", $rawText);
        $lines = explode("\n", $rawText);
        $unfolded = [];

        foreach ($lines as $line) {
            if ($line !== '' && ($line[0] === ' ' || $line[0] === "\t") && count($unfolded) > 0) {
                $unfolded[count($unfolded) - 1] .= substr($line, 1);
            } else {
                $unfolded[] = $line;
            }
        }

        return $unfolded;
    }

    /** Splits "NAME;PARAM=VAL:value" into [name, params, value]. */
    private static function parsePropertyLine(string $line): array
    {
        $colonPos = strpos($line, ':');
        if ($colonPos === false) {
            return [null, [], null];
        }

        $head = substr($line, 0, $colonPos);
        $value = substr($line, $colonPos + 1);
        $parts = explode(';', $head);
        $name = strtoupper(array_shift($parts));

        $params = [];
        foreach ($parts as $part) {
            $eqPos = strpos($part, '=');
            if ($eqPos !== false) {
                $key = strtoupper(substr($part, 0, $eqPos));
                $params[$key] = substr($part, $eqPos + 1);
            }
        }

        return [$name, $params, $value];
    }

    private static function unescapeText(string $value): string
    {
        return str_replace(
            ['\\n', '\\N', '\\,', '\\;', '\\\\'],
            ["\n", "\n", ',', ';', '\\'],
            $value
        );
    }

    /** @return array{0: string, 1: bool}|null [ISO-8601 string, isAllDay] */
    private static function parseDateTime(string $value, array $params): ?array
    {
        $value = trim($value);
        $isAllDay = ($params['VALUE'] ?? null) === 'DATE' || preg_match('/^\d{8}$/', $value) === 1;

        try {
            if ($isAllDay) {
                $dt = DateTime::createFromFormat('Ymd', $value, new DateTimeZone('UTC'));
                if ($dt === false) {
                    return null;
                }
                $dt->setTime(0, 0, 0);
                return [$dt->format('Y-m-d\TH:i:s'), true];
            }

            if (str_ends_with($value, 'Z')) {
                $dt = DateTime::createFromFormat('Ymd\THis\Z', $value, new DateTimeZone('UTC'));
                if ($dt === false) {
                    return null;
                }
                return [$dt->format(DateTime::ATOM), false];
            }

            $dt = DateTime::createFromFormat('Ymd\THis', $value);
            if ($dt === false) {
                return null;
            }
            return [$dt->format('Y-m-d\TH:i:s'), false];
        } catch (Exception) {
            return null;
        }
    }

    private static function finalizeEvent(array $raw): array
    {
        $summary = $raw['summary'] ?? '(untitled)';
        $course = self::resolveCourse($summary, $raw['location'] ?? null, $raw['categories'] ?? null);

        return [
            'uid' => $raw['uid'] ?? null,
            'title' => $summary,
            'course' => $course['code'],
            'course_label' => $course['label'],
            'start' => $raw['start'] ?? null,
            'end' => $raw['end'] ?? null,
            'all_day' => $raw['all_day'] ?? false,
            'url' => self::extractFirstUrl($raw['description'] ?? ''),
        ];
    }

    /**
     * Brightspace's calendar feed puts a structured course identifier in
     * LOCATION, of the form:
     *   "WEBD1000/2803/2804/Website Development(B)/Symonds,Jamie"
     * i.e. course-code / section / section / ... / description / instructor.
     * The course code is always the first token, conventionally 8
     * characters (4 letters + 4 digits). The instructor is the last token
     * (it contains a comma: "Last,First"); the description is the last
     * remaining token that isn't purely numeric (a section number); any
     * tokens left in between are section numbers.
     *
     * Falls back to CATEGORIES, then to guessing from the title, when
     * LOCATION isn't usable.
     *
     * @return array{code: string, sections: array<int, string>, description: string, instructor: string, label: string}
     */
    private static function resolveCourse(string $summary, ?string $location, ?string $categories): array
    {
        if ($location !== null && trim($location) !== '') {
            $parsed = self::parseLocation($location);
            if ($parsed !== null) {
                return $parsed;
            }
        }

        if ($categories !== null && trim($categories) !== '') {
            $code = trim($categories);
            return ['code' => $code, 'sections' => [], 'description' => '', 'instructor' => '', 'label' => $code];
        }

        $code = self::guessCourseFromTitle($summary);
        return ['code' => $code, 'sections' => [], 'description' => '', 'instructor' => '', 'label' => $code];
    }

    private static function parseLocation(string $location): ?array
    {
        $parts = array_values(array_filter(
            array_map('trim', explode('/', $location)),
            static fn(string $p) => $p !== ''
        ));

        if (count($parts) === 0) {
            return null;
        }

        $code = strtoupper(substr($parts[0], 0, 8));
        $rest = array_slice($parts, 1);

        $instructor = '';
        if (count($rest) > 0 && str_contains(end($rest), ',')) {
            $instructor = array_pop($rest);
        }

        $description = '';
        if (count($rest) > 0) {
            $last = end($rest);
            // A trailing token that isn't purely numeric is the course
            // description; purely-numeric tokens are section numbers.
            if (preg_match('/^\d+$/', $last) !== 1) {
                $description = array_pop($rest);
            }
        }

        $sections = $rest;

        $label = $code;
        if ($description !== '') {
            $label .= " \u{2013} " . $description;
        }

        return [
            'code' => $code,
            'sections' => $sections,
            'description' => $description,
            'instructor' => $instructor,
            'label' => $label,
        ];
    }

    /**
     * Last-resort fallback when a feed has no LOCATION or CATEGORIES:
     * Brightspace summaries are often "Course Code - Item name" or
     * "[Course] Item name".
     */
    private static function guessCourseFromTitle(string $summary): string
    {
        if (preg_match('/^\[(.+?)\]\s*(.*)$/', $summary, $m) === 1) {
            return $m[1];
        }

        if (preg_match('/^([A-Za-z]{2,10}\s?\d{3,4}[A-Za-z]?)\s*[-:\x{2013}]\s*(.*)$/u', $summary, $m) === 1) {
            return $m[1];
        }

        return 'Course';
    }

    /**
     * Brightspace's DESCRIPTION typically contains two URLs back to the
     * item in Brightspace; the first one is the one that actually works
     * for students. Trailing punctuation that isn't part of the URL
     * (a period ending the sentence, a closing paren) is stripped off.
     */
    private static function extractFirstUrl(string $description): ?string
    {
        if (preg_match('/https?:\/\/[^\s<>"\']+/i', $description, $m) !== 1) {
            return null;
        }
        return rtrim($m[0], ".,)]'\"");
    }
}
