import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function BookDetail() {
  const { bookId } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBook() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://127.0.0.1:8000/books/${bookId}`
        );

        if (!response.ok) {
          throw new Error("Book not found");
        }

        const data = await response.json();
        setBook(data);

      } catch (error) {
        setError(error.message);

      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [bookId]);

  if (loading) {
    return <p>Loading book...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const imageUrl = book.cover_image
    ? `http://127.0.0.1:8000/${book.cover_image}`
    : null;

  return (
    <main className="book-detail">

      <Link to="/" className="back-link">
        ← Back to books
       </Link>

      <div className="book-detail-content">

        {imageUrl && (
          <img
            src={imageUrl}
            alt={book.book_name}
            className="book-detail-cover"
          />
        )}

        <div className="book-detail-info">

          <h1>{book.book_name}</h1>

          <p><strong>ISBN:</strong> {book.isbn13}</p>

          <p>
            <strong>First publication:</strong>{" "}
            {book.first_publication_date}
          </p>

          <h2>Summary</h2>
          <p>{book.summary}</p>

          <h2>Authors</h2>
          {book.authors.map((author) => (
            <p key={author.author_id}>
              {author.full_name}
            </p>
          ))}

          <h2>Genres</h2>
          <div>
            {book.genres.map((genre) => (
                <span className="genre-badge" key={genre.genre_id}>
                {genre.genre_name}
                </span>
            ))}
            </div>

        </div>
      </div>
    </main>
  );
}

export default BookDetail;