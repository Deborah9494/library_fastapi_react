import { useState, useEffect } from 'react'
import './App.css'
import Book from './Book'

function App() {
  const [genres, setGenres] = useState([])
  const [books, setBooks] = useState([])
  const [selectedGenre, setSelectedGenre] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const [totalBooks, setTotalBooks] = useState(0)

  const booksPerPage = 5
  const totalPages = Math.ceil(totalBooks / booksPerPage)

  // Retrieve genres when the component loads
  useEffect(() => {
    fetch('http://127.0.0.1:8000/genres')
      .then(response => response.json())
      .then(data => setGenres(data.genres))
      .catch(error => console.error('Error fetching genres:', error))
  }, [])

  // Retrieve books whenever the selected genre or page changes
  useEffect(() => {
    const offset = (currentPage - 1) * booksPerPage
    const url = new URL('http://127.0.0.1:8000/books')

    url.searchParams.set('limit', booksPerPage)
    url.searchParams.set('offset', offset)

    if (selectedGenre) {
      url.searchParams.set('genre', selectedGenre)
    }

    fetch(url)
      .then(response => response.json())
      .then(data => {
        setBooks(data.books)
        setTotalBooks(data.total)
      })
      .catch(error => console.error('Error fetching books:', error))
  }, [selectedGenre, currentPage])

  return (
    <div className="app">

      {/* HEADER */}
      <header className="site-header">
        <div className="header-content">

          <a href="#" className="site-logo">
            <span className="logo-easy">Easy</span>
            <span className="logo-library">Library</span>
          </a>

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
          <a href="#" className="nav-link active">Books</a>
          <a href="#" className="nav-link">Genres</a>
          <a href="#" className="nav-link">Authors</a>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <main className="main-content">

        <section className="books-section">

          <h1 className="page-title">Books</h1>

          {/* FILTERS */}
          <div className="filter-section">
            <label htmlFor="genre">Filter by genre:</label>

            <select
              id="genre"
              value={selectedGenre}
              onChange={(event) => {
                setSelectedGenre(event.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">All genres</option>

              {genres.map((genre) => (
                <option key={genre.genre_id} value={genre.genre_name}>
                  {genre.genre_name}
                </option>
              ))}
            </select>
          </div>

          {/* BOOK GRID */}
          <div className="book-grid">
            {books.map((book) => (
              <Book key={book.book_id} book={book} />
            ))}
          </div>

          {/* PAGINATION */}
          <div className="pagination-container">

            <button
              className="btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span className="pagination-info">
              Page {currentPage} of {Math.max(1, totalPages)}
            </span>

            <button
              className="btn"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>

          </div>

        </section>
      </main>
    </div>
  )
}

export default App