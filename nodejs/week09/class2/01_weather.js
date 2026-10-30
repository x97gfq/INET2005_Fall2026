// Class 2, step 1: the server calls someone else's API, then renders the answer with EJS
// Run:  docker compose exec node node week09/class2/01_weather.js
// Open http://localhost:3001/weather?city=Halifax
//
// Until now our routes got their data from MongoDB. Here the data comes from another
// company's JSON API (Open-Meteo: free, no key). The route is the same shape as week 9's
// GET /movies - await the data, then res.render() - only the "await" changed:
//
//   Movie.find(...)                     ->  fetch('https://api.open-meteo.com/...')
//
// The BROWSER never talks to Open-Meteo. Open DevTools > Network: one request, to /weather.
// That's the point - when the API needs a secret key (the trivia assignment does), the key
// stays on the server, in .env, and never reaches the page.

const path = require('path');
const express = require('express');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Open-Meteo's weather codes (WMO), the ones you'll actually see
const CONDITIONS = {
  0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Freezing fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  80: 'Showers', 81: 'Showers', 82: 'Heavy showers',
  95: 'Thunderstorm',
};
const describe = (code) => CONDITIONS[code] || `Code ${code}`;

// fetch() is built into Node 18+, the same function the browser has. Two habits:
//   1. a timeout - a slow API shouldn't hang our page forever
//   2. check res.ok - fetch() only throws on a network failure, NOT on a 404 or 500
async function getJson(url) {
  console.log('-> GET', url);
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`${new URL(url).host} replied ${res.status}`);
  return res.json();
}

// Free APIs have rate limits. Remember answers for 10 minutes so a refresh doesn't
// cost another call. (In memory: a restart forgets them, like week 9's sessions.)
const cache = new Map();
const TEN_MINUTES = 10 * 60 * 1000;

async function weatherFor(city) {
  const key = city.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TEN_MINUTES) return hit.data;

  // Call 1: city name -> latitude/longitude. URLSearchParams encodes "St. John's" safely.
  const geo = await getJson('https://geocoding-api.open-meteo.com/v1/search?' +
    new URLSearchParams({ name: city, count: 1 }));
  if (!geo.results || geo.results.length === 0) return null; // not found isn't an error

  const place = geo.results[0];

  // Call 2: needs call 1's answer, so it has to wait for it
  const forecast = await getJson('https://api.open-meteo.com/v1/forecast?' + new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code',
    timezone: 'auto',
    forecast_days: 3,
  }));

  // Keep only what the page needs, with names the template can read
  const data = {
    place: [place.name, place.admin1, place.country].filter(Boolean).join(', '),
    now: {
      temp: Math.round(forecast.current.temperature_2m),
      feelsLike: Math.round(forecast.current.apparent_temperature),
      wind: Math.round(forecast.current.wind_speed_10m),
      conditions: describe(forecast.current.weather_code),
    },
    days: forecast.daily.time.map((date, i) => ({
      date,
      high: Math.round(forecast.daily.temperature_2m_max[i]),
      low: Math.round(forecast.daily.temperature_2m_min[i]),
      conditions: describe(forecast.daily.weather_code[i]),
    })),
  };
  cache.set(key, { at: Date.now(), data });
  return data;
}

app.get('/', (req, res) => res.redirect('/weather'));

app.get('/weather', async (req, res) => {
  const city = typeof req.query.city === 'string' ? req.query.city.trim() : '';
  if (!city) return res.render('weather', { city, weather: null, error: null });

  try {
    const weather = await weatherFor(city);
    if (!weather) {
      return res.status(404).render('weather', { city, weather: null, error: `No place called "${city}".` });
    }
    res.render('weather', { city, weather, error: null });
  } catch (err) {
    // Their API is down, slow, or we're offline. Log the details, show a polite page.
    console.error('Weather lookup failed:', err.message);
    res.status(502).render('weather', { city, weather: null, error: 'The weather service is not answering. Try again in a minute.' });
  }
});

app.listen(PORT, () => console.log(`Weather on http://localhost:${PORT}/weather?city=Halifax`));
