function Book({ book }) {
  return (
    <article className="card book-card">
        <h3>{book.book_name}</h3>
        <p>Book ID: {book.book_id}</p>
    </article>
  )
}

export default Book