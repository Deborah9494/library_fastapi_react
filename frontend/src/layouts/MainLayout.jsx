import { Outlet, Link, NavLink } from 'react-router-dom'
import '../App.css'

function MainLayout() {
  return (
    <div className="app">

      {/* HEADER */}
      <header className="site-header">
        <div className="header-content">

          <Link to="/" className="site-logo">
            <span className="logo-easy">Easy</span>
            <span className="logo-library">Library</span>
          </Link>

          <div className="search-bar">
            <input
              type="search"
              placeholder="Search books, authors..."
              aria-label="Search books and authors"
            />
            <button type="button" className="search-button" aria-label="Search">
              &#128269;
            </button>
          </div>

          <div className="account-buttons">
            <button type="button" className="sign-in-button">
              Sign in
            </button>
            <button type="button" className="join-button">
              Join
            </button>
          </div>

        </div>
      </header>

      {/* MAIN NAVIGATION */}
      <nav className="main-navigation">
        <div className="navigation-content">

          <NavLink to="/" className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'
          }>
            Books
          </NavLink>

          <NavLink to="/genres" className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'
          }>
            Genres
          </NavLink>

          <NavLink to="/authors" className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'
          }>
            Authors
          </NavLink>

        </div>
      </nav>

      <Outlet />

    </div>
  )
}

export default MainLayout