// Week 9's partials/header.ejs, as a component. username comes in as a prop.
export default function NavBar({ username }) {
  return (
    <nav className="navbar bg-dark" data-bs-theme="dark">
      <div className="container">
        <span className="navbar-brand">mflix</span>
        <span className="navbar-text">
          {username ? `Logged in as ${username}` : 'Not logged in'}
        </span>
      </div>
    </nav>
  )
}
