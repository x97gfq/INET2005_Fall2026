import { useEffect, useState } from 'react'
import { api } from './api.js'
import NavBar from './NavBar.jsx'
import AuthForm from './AuthForm.jsx'
import MovieList from './MovieList.jsx'

// Week 11, with the AI button. App holds the one piece of state every part needs: who is logged in.
// It's a COPY of what the server knows. The session (on the server) is the real thing.
function App() {
  const [username, setUsername] = useState(null)
  const [checking, setChecking] = useState(true) // until /api/session answers
  const [form, setForm] = useState('login')       // logged out: 'login' or 'register'
  const [notice, setNotice] = useState(null)

  // On page load (and after F5): ask the server. React forgets everything on a reload;
  // the cookie and the session don't.
  useEffect(() => {
    api('/session')
      .then((data) => setUsername(data.username))
      .catch(() => setUsername(null))
      .finally(() => setChecking(false))
  }, [])

  async function logout() {
    await api('/logout', { method: 'POST' })
    setUsername(null)
    setForm('login')
    setNotice(null)
  }

  function registered() {
    setNotice('Account created. Now log in.')
    setForm('login')
  }

  function loggedIn(name) {
    setNotice(null)
    setUsername(name)
  }

  function expired() {
    setNotice('Your session expired. Please log in again.')
    setUsername(null)
  }

  let page
  if (checking) page = <p className="text-muted">Loading...</p>
  else if (username) page = <MovieList onExpired={expired} />
  else page = <AuthForm mode={form} notice={notice} onLoggedIn={loggedIn} onRegistered={registered} />

  return (
    <>
      <NavBar username={username} onLogout={logout} onShow={setForm} />
      <div className="container my-4">{page}</div>
    </>
  )
}

export default App
