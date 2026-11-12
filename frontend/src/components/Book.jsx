import { Link } from 'react-router-dom'

function Book({ book }) {
  return (
    <Link
      to={`/books/${book.book_id}`}
      className="book-link"
    >
      <article className="card book-card">
        <h3>{book.book_name}</h3>
        <p>Book ID: {book.book_id}</p>
      </article>
    </Link>
  )
}

export default Book