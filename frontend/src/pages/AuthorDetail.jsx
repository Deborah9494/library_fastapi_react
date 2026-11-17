import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Book from '../components/Book'

function AuthorDetail() {
  const { authorId } = useParams()

  const [author, setAuthor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchAuthor() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `http://127.0.0.1:8000/authors/${authorId}`
        )

        if (!response.ok) {
          throw new Error('Author not found')
        }

        const data = await response.json()
        setAuthor(data)

      } catch (error) {
        setError(error.message)

      } finally {
        setLoading(false)
      }
    }

    fetchAuthor()
  }, [authorId])

  if (loading) {
    return <main className="author-detail"><p>Loading author...</p></main>
  }

  if (error) {
    return <main className="author-detail"><p>{error}</p></main>
  }

  return (
    <main className="author-detail">

      <Link to="/authors" className="back-link">
        ← Back to authors
      </Link>

      <section className="author-detail-header">
        <span className="author-label">AUTHOR</span>

        <h1>{author.full_name}</h1>

        <p>
          Explore the books for this author.
        </p>

        <span className="author-book-count">
          {author.books.length} {author.books.length === 1 ? 'book' : 'books'}
        </span>
      </section>

      <section className="author-books-section">
        <h2>Books of this author</h2>

        {author.books.length > 0 ? (
          <div className="book-grid">
            {author.books.map((book) => (
              <Book key={book.book_id} book={book} />
            ))}
          </div>
        ) : (
          <p className="empty-message">
            No books are currently available for this author.
          </p>
        )}

      </section>

    </main>
  )
}

export default AuthorDetail