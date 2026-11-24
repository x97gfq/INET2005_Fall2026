import { useState } from 'react'

// Week 12 class 2: the login form (typed in class). POST /api/login, then hand { token, name } up to App.
// Props:
//   onLogin({ token, name })  - the API answered 200: App keeps the token and sends it from now on
export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault() // no page reload (and no password in the URL)
    setError('')
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.status === 200) {
        onLogin(await res.json()) // { token, name }
      } else if (res.status === 400 || res.status === 401) {
        setError((await res.json()).error) // Wrong email or password.
      } else {
        setError(`The server answered ${res.status}. Is the API running?`) // the 502 has no body
      }
    } catch {
      setError('Could not reach the server.')
    }
  }

  return (
    <form className="card card-body mb-3" onSubmit={handleSubmit}>
      <h2 className="h6 mb-2">Log in to add or delete movies</h2>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <div className="row g-2">
        <div className="col-sm-5">
          <input className="form-control" type="email" placeholder="Email" autoComplete="username"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="col-sm-4">
          <input className="form-control" type="password" placeholder="Password" autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="col-sm-3 d-grid">
          <button className="btn btn-primary">Log in</button>
        </div>
      </div>
    </form>
  )
}
