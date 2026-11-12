import { Link } from 'react-router-dom'

function Book({ book }) {
  const imageUrl = book.cover_image
    ? `http://127.0.0.1:8000/${book.cover_image}`
    : null

  return (
    <Link to={`/books/${book.book_id}`} className="book-link">
      <article className="book-card">

        <div className="book-card-inner">

          {/* FRONT: BOOK COVER */}
          <div className="book-card-front">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={book.book_name}
                className="book-cover"
              />
            ) : (
              <div className="book-cover-placeholder">
                No cover available
              </div>
            )}
          </div>

          {/* BACK: BOOK INFORMATION */}
          <div className="book-card-back">
            <h3>{book.book_name}</h3>
            <p>{book.shortsummary || 'No summary available.'}</p>
          </div>

        </div>
      </article>
    </Link>
  )
}

export default Book