import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

function BookDetail() {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

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

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.book_name}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/books/${bookId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Could not delete book");
      }

      navigate("/");

    } catch (error) {
      setError(error.message);
      setDeleting(false);
    }
  }

  if (loading) {
    return <p>Loading book...</p>;
  }

  if (error && !book) {
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

      {error && <p className="form-error">{error}</p>}

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
            <Link
              to={`/authors/${author.author_id}`}
              className="author-link"
              key={author.author_id}
            >
              {author.full_name}
            </Link>
          ))}

          <h2>Genres</h2>

          <div className="genre-list">
            {book.genres.map((genre) => (
              <Link
                to={`/genres/${genre.genre_id}`}
                className="genre-badge"
                key={genre.genre_id}
              >
                {genre.genre_name}
              </Link>
            ))}
          </div>

          <div className="form-actions">
            <Link
              to={`/books/${bookId}/edit`}
              className="btn btn-primary"
            >
              Edit Book
            </Link>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Book"}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}

export default BookDetail;