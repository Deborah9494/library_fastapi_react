import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Book from '../components/Book'

function AuthorDetail() {
  const { authorId } = useParams()
  const navigate = useNavigate();


  const [author, setAuthor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false);

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
  }, [authorId]);


    async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${author.full_name}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/authors/${authorId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Could not delete author");
      }

      navigate("/authors");

    } catch (error) {
      setError(error.message);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="author-detail">
        <p>Loading author...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="author-detail">
        <p>{error}</p>
      </main>
    )
  }

  // Calculate the total number of books
  const seriesBookCount = author.series.reduce(
    (total, series) => total + series.books.length,
    0
  )

  const totalBooks = seriesBookCount + author.standalone_books.length

  return (
    <main className="author-detail">

      <Link to="/authors" className="back-link">
        ← Back to authors
      </Link>

      <section className="author-detail-header">
        <span className="author-label">AUTHOR</span>

        <h1>{author.full_name}</h1>

        <p>{author.summary}</p>

        <p>Explore the books for this author.</p>

        <span className="author-book-count">
          {totalBooks} {totalBooks === 1 ? 'book' : 'books'}
        </span>
      </section>

      {/* BOOK SERIES */}
      {author.series.length > 0 && (
        <section className="author-books-section">
          <h2>Book series</h2>

          {author.series.map((series) => (
            <div className="author-series" key={series.series_id}>

              <h3>{series.series_name}</h3>

              {series.series_description && (
                <p>{series.series_description}</p>
              )}

              <div className="book-grid">
                {series.books.map((book) => (
                  <Book key={book.book_id} book={book} />
                ))}
              </div>

            </div>
          ))}
        </section>
      )}

      {/* STANDALONE BOOKS */}
        {author.standalone_books.length > 0 && (
        <section className="author-books-section">
            <h2>{author.series.length > 0 ? 'Other books' : 'Books'}</h2>

            <div className="book-grid">
            {author.standalone_books.map((book) => (
                <Book key={book.book_id} book={book} />
            ))}
            </div>
        </section>
        )}

      {/* NO BOOKS */}
      {totalBooks === 0 && (
        <p className="empty-message">
          No books are currently available for this author.
        </p>
      )}

      <div className="form-actions">
        <Link
          to={`/authors/${authorId}/edit`}
          className="btn btn-primary"
        >
          Edit Author
        </Link>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete Author"}
        </button>
      </div>

    </main>
  )
}

export default AuthorDetail