import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Book from '../components/Book'

function BooksPage() {
  const [genres, setGenres] = useState([])
  const [books, setBooks] = useState([])
  const [selectedGenre, setSelectedGenre] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const [totalBooks, setTotalBooks] = useState(0)

  const [booksPerPage, setBooksPerPage] = useState(5)
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
  }, [selectedGenre, currentPage, booksPerPage])

  function getPageNumbers() {
    const pages = []
    if (totalPages <= 7) {
      // Show all pages when there are 7 or fewer
      for (let page = 1; page <= totalPages; page++) {
        pages.push(page)
      }
    } else {
      // Always show the first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }
      // Show the current page and its neighbours
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let page = start; page <= end; page++) {
        pages.push(page)
      }
      if (currentPage < totalPages - 2) {
        pages.push('...')
      }
      // Always show the last page
      pages.push(totalPages)
    }
    return pages
  }

  return (
      <main className="main-content">

        <section className="books-section">

          <div className="books-header">
            <h1 className="page-title">Books</h1>

            <div className="book-actions">
              <Link to="/books/new" className="btn btn-primary">
                + Add a Book
              </Link>

              <Link to="/books/import" className="btn btn-secondary">
                Import a Book
              </Link>
            </div>
          </div>

          {/* FILTERS */}
          <div className="filter-section">
            <div className="filter-group">
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

            <div className="filter-group">
              <label htmlFor="booksPerPage">Books per page:</label>

              <select
                id="booksPerPage"
                value={booksPerPage}
                onChange={(event) => {
                  setBooksPerPage(Number(event.target.value))
                  setCurrentPage(1)
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
              </select>
            </div>
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
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              «
            </button>
            <button
              className="btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  className={`btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              )
            ))}
            <button
              className="btn"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              ›
            </button>
            <button
              className="btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              »
            </button>
          </div>

        </section>
      </main>
  )
}

export default BooksPage