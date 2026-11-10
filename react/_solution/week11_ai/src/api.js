// Every call to our server goes through this one function:
//   - JSON in, JSON out
//   - our CSRF header on every request (mflix-bff refuses a POST without it)
//   - an error with the server's message when the answer isn't ok
// No token anywhere: the browser sends the session cookie by itself (same origin).
export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch('/api' + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'mflix-react',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`)
    err.status = res.status // so a 401 can send us back to the login form
    throw err
  }
  return data
}
