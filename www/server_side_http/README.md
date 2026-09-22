# Server-Side HTTP in PHP

So far, your PHP pages have answered requests *from* the browser. In this folder, PHP also **sends** requests: your server contacts another server on the internet, gets data back (usually JSON) and uses it to build the page.

```text
Browser --(1) request--> your PHP page --(2) cURL request--> external API
Browser <--(4) HTML----- your PHP page <--(3) JSON---------- external API
```

1. The browser asks your server for a page, like any other PHP page.
2. Your PHP code sends its own HTTP request to an external API. The browser never sees this request.
3. The API sends back data, usually as JSON text.
4. PHP turns that JSON into a PHP array, builds HTML from it and sends the finished page to the browser.

In this relationship, your PHP page is a **client** of the external API, just like your browser is a client of your server.

# Running the Examples

Start the stack from the root of the repo:

```bash
docker compose up -d --build
```

Then open these pages:

| Page | What it shows |
| --- | --- |
| http://localhost/server_side_http/01_curl_direct.php | **Example 1:** call the Open-Meteo weather API with cURL and show the result |
| http://localhost/server_side_http/02_weather_proxy.php?lat=44.65&lon=-63.57 | **Example 2:** a **proxy** that returns weather JSON in *our* format |
| http://localhost/server_side_http/03_weather_client.php | **Example 3:** a page that uses our proxy and never contacts Open-Meteo directly |
| http://localhost/server_side_http/activity.php | **In-class activity:** a Pokédex using PokéAPI (starter code) |

All of these APIs are free and need **no API key**, so they should work as soon as the stack is running.

# The Files

| File | What it does |
| --- | --- |
| `helpers.php` | Shared code. `http_get()` wraps the cURL steps in one function. `read_coordinates()` safely reads `?lat=` and `?lon=` from the URL. `demo_cities()` supplies the city buttons. |
| `01_curl_direct.php` | Writes every cURL step out longhand so you can see each option. It builds the page straight from Open-Meteo's JSON. |
| `02_weather_proxy.php` | Outputs **JSON, not HTML**. It checks the input, calls Open-Meteo, reshapes the answer into our own format and uses proper status codes when something goes wrong. |
| `03_weather_client.php` | A normal HTML page that reads JSON from *our* proxy (Example 2) with `file_get_contents()`. |
| `activity.php` | The in-class activity. Complete the TODOs (see below). |

# Key Ideas

## Making a request with cURL

cURL is PHP's built-in tool for making HTTP requests. Every request follows the same four steps:

```php
$ch = curl_init($url);                        // 1. create a request for this URL
curl_setopt_array($ch, [                      // 2. set options
    CURLOPT_RETURNTRANSFER => true,           //    return the body as a string instead of printing it
    CURLOPT_TIMEOUT        => 8,              //    give up after 8 seconds, so a slow API can't freeze our page
    CURLOPT_FOLLOWLOCATION => true,           //    follow redirects (301/302)
    CURLOPT_SSL_VERIFYPEER => true,           //    check the HTTPS certificate is genuine
    CURLOPT_HTTPHEADER     => ['Accept: application/json'],  // tell the API we want JSON
]);
$body = curl_exec($ch);                       // 3. send it; $body is the response text (or false)
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE); //   the HTTP status code, e.g. 200 or 404
curl_close($ch);                              // 4. clean up
```

`01_curl_direct.php` shows these steps in full. Every other file uses `http_get($url)` from `helpers.php`, which runs the same steps and returns an array:

```php
$response = http_get($url);
// $response['ok']     true if we got a response with a status below 400
// $response['status'] the HTTP status code (200, 404, 500...)
// $response['body']   the response text
// $response['error']  a message describing what went wrong, or null
```

**Always check for failure.** Another server can be slow, down or return an error, and your page should show a friendly message instead of crashing.

## Turning JSON into a PHP array

The API sends back JSON **text**. `json_decode()` turns that text into a PHP array:

```php
$data = json_decode($response['body'], true);   // true = give me an associative array
echo $data['name'];                              // now use it like any other array
```

Without `true`, you get a PHP *object* and have to write `$data->name` instead. We use arrays throughout this course.

JSON is often **nested** (objects inside objects, lists inside objects). You reach into it one key at a time:

```php
$data['sprites']['front_default']      // an object inside an object
$data['types'][0]['type']['name']      // the first item [0] of a list, then two more keys
```

## Building a safe URL

Anything a user types must be encoded before it goes into a URL, or a space or symbol could break the request:

```php
// One value in the path
$url = 'https://pokeapi.co/api/v2/pokemon/' . urlencode($name);

// Several ?key=value parameters: http_build_query() encodes them all for you
$url = 'https://api.open-meteo.com/v1/forecast?' . http_build_query([
    'latitude'  => 44.65,
    'longitude' => -63.57,
]);
```

## Escaping the output

Data from someone else's server is still **untrusted input**. Wrap every value in `htmlspecialchars()` before you echo it into your HTML, so nobody can slip `<script>` tags into your page:

```php
<td><?php echo htmlspecialchars($data['name']); ?></td>
```

# Why Make the Request on the Server?

JavaScript in the browser can call APIs too, so why do it in PHP?

- **Secrets stay secret.** Many APIs need a key. If the browser makes the call, anyone can open DevTools and copy your key. On the server, it never leaves PHP.
- **No CORS problems.** Browsers block many cross-site requests (CORS). Server-to-server requests have no such rule.
- **You stay in control.** You choose the timeouts, retries and error messages.
- **Your own format.** A proxy (Example 2) returns data in *your* shape. If you switch weather providers later, you only change the proxy, and every page that uses it keeps working.
- **One place for caching and logging.** Save responses so you don't call the API on every page load, and record what happened when something goes wrong.

Compare Example 1 and Example 3. Example 1 shows the raw Open-Meteo weather code (a number like `3`), so the page has to understand Open-Meteo's format. Example 3 shows `Partly cloudy`, because the proxy translated it first.

# Activity: Pokédex

You are going to build a small Pokédex page using live data from [PokéAPI](https://pokeapi.co).

## Step 0: Look at the JSON first

Before writing any code, open this URL in your browser:

```text
https://pokeapi.co/api/v2/pokemon/pikachu
```

That is exactly what your PHP code will receive. It is long, but you only need a few pieces. Here they are with everything else removed:

```json
{
  "name": "pikachu",
  "height": 4,
  "weight": 60,
  "sprites": {
    "front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
  },
  "types": [
    { "slot": 1, "type": { "name": "electric" } }
  ]
}
```

Tip: Firefox formats JSON automatically. In Chrome or Edge, tick **Pretty-print** at the top of the page.

## Step 1: Build the request URL (TODO 1)

Open `activity.php`. The form puts whatever the user typed into `$name`, lowercased (`pikachu` by default).

Set `$url` to the PokéAPI address with the name on the end. Use the `.` operator to join the strings, and wrap `$name` in `urlencode()`.

Reload the page. If it worked, the TODO 1 message goes away, you see a table with the Pokémon's name, and the "Request made by PHP" line at the bottom shows your URL. Click that URL. It should show the same JSON as Step 0.

## Step 2: Show the data in the table (TODO 2)

The table already has one row, **Name**, which you can use as your pattern:

```php
<tr>
  <th>Name</th>
  <td><?php echo htmlspecialchars($data['name']); ?></td>
</tr>
```

Copy that pattern to add four more rows:

| Row | Where it is in `$data` | Notes |
| --- | --- | --- |
| Picture | `$data['sprites']['front_default']` | This is an image URL. Put it in the `src` of an `<img>` tag instead of printing it as text. |
| Height | `$data['height']` | Measured in decimetres (Pikachu's `4` = 0.4 m) |
| Weight | `$data['weight']` | Measured in hectograms (Pikachu's `60` = 6 kg) |
| Type | `$data['types'][0]['type']['name']` | `types` is a list, so `[0]` picks the first one |

Remember `htmlspecialchars()` on every value, including the image URL.

## Try it out

Search for a few different Pokémon: `charizard`, `snorlax`, `mewtwo`, `eevee`. Then search for a name that does not exist, like `pikachoo`, and watch the error message. PokéAPI answers with a **404 Not Found**, `http_get()` sets `ok` to `false`, and the page shows a friendly message instead of crashing.

When you are done, search for your favourite Pokémon, take a screenshot and submit it to Brightspace.

## Bonus

- Convert the height to metres and the weight to kilograms before displaying them.
- Some Pokémon have two types (try `charizard`). Use a `foreach` over `$data['types']` to show all of them.
- Add a row for each base stat (HP, Attack, Defense...) by looping over `$data['stats']`. Each item has `['stat']['name']` and `['base_stat']`.

## Stuck?

| Problem | What to check |
| --- | --- |
| Still says `TODO 1: build $url` | `$url` is still an empty string. Did you save the file? |
| "Could not find a Pokémon called..." for every name | Click the URL at the bottom of the page. Is there a missing `/`, or an extra space? |
| `Warning: Undefined array key` | A key is spelled wrong. Compare your spelling with the JSON in your browser, one key at a time. |
| The picture shows as a long URL instead of an image | You echoed the URL as text. It needs to go inside `<img src="...">`. |
| Nothing works at all | Is Docker running? Try `docker compose up -d` again. |
