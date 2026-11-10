import { useState } from 'react'
import { api } from './api.js'

// Week 9's login.ejs AND register.ejs: one form, two modes.
// "Controlled" inputs: the value lives in state, and every keystroke updates it.
export default function AuthForm({ mode, notice, onLoggedIn, onRegistered }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const isLogin = mode === 'login'

  async function handleSubmit(e) {
    e.preventDefault() // no page reload: we send it ourselves, with fetch()
    setError(null)
    try {
      if (isLogin) {
        const data = await api('/login', { method: 'POST', body: { username, password } })
        onLoggedIn(data.username)
      } else {
        await api('/register', { method: 'POST', body: { username, password } })
        setPassword('')
        onRegistered()
      }
    } catch (err) {
      setError(err.message) // the API's own message: "That username is taken", ...
    }
  }

  return (
    <div style={{ maxWidth: '28rem' }}>
      <h1 className="mb-3">{isLogin ? 'Log in' : 'Register'}</h1>
      {notice && <div className="alert alert-success">{notice}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label" htmlFor="username">Username</label>
          <input className="form-control" id="username" value={username}
            onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="password">Password</label>
          <input className="form-control" id="password" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary">{isLogin ? 'Log in' : 'Register'}</button>
      </form>
    </div>
  )
}
