// Week 9's partials/header.ejs, as a component: the username and Log out when logged in,
// otherwise Log in and Register. Clicks call functions App passed in as props.
export default function NavBar({ username, onLogout, onShow }) {
  return (
    <nav className="navbar bg-dark" data-bs-theme="dark">
      <div className="container">
        <span className="navbar-brand">mflix</span>
        {username ? (
          <div className="d-flex align-items-center gap-3">
            <span className="navbar-text">{username}</span>
            <button className="btn btn-sm btn-outline-light" onClick={onLogout}>Log out</button>
          </div>
        ) : (
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-link nav-link" onClick={() => onShow('login')}>Log in</button>
            <button className="btn btn-sm btn-link nav-link" onClick={() => onShow('register')}>Register</button>
          </div>
        )}
      </div>
    </nav>
  )
}
