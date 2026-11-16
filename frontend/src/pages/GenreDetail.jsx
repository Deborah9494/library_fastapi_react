import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Book from '../components/Book'

function GenreDetail() {
  const { genreId } = useParams()

  const [genre, setGenre] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchGenre() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `http://127.0.0.1:8000/genres/${genreId}`
        )

        if (!response.ok) {
          throw new Error('Genre not found')
        }

        const data = await response.json()
        setGenre(data)

      } catch (error) {
        setError(error.message)

      } finally {
        setLoading(false)
      }
    }

    fetchGenre()
  }, [genreId])

  if (loading) {
    return <main className="genre-detail"><p>Loading genre...</p></main>
  }

  if (error) {
    return <main className="genre-detail"><p>{error}</p></main>
  }

  return (
    <main className="genre-detail">

      <Link to="/genres" className="back-link">
        ← Back to genres
      </Link>

      <section className="genre-detail-header">
        <span className="genre-label">BOOK CATEGORY</span>

        <h1>{genre.genre_name}</h1>

        <p>
          Explore the books in this category.
        </p>

        <span className="genre-book-count">
          {genre.books.length} {genre.books.length === 1 ? 'book' : 'books'}
        </span>
      </section>

      <section className="genre-books-section">
        <h2>Books in this genre</h2>

        {genre.books.length > 0 ? (
          <div className="book-grid">
            {genre.books.map((book) => (
              <Book key={book.book_id} book={book} />
            ))}
          </div>
        ) : (
          <p className="empty-message">
            No books are currently available for this genre.
          </p>
        )}

      </section>

    </main>
  )
}

export default GenreDetail