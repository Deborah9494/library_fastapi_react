from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import get_connection
from fastapi.staticfiles import StaticFiles
from pathlib import Path

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent

app.mount(
    "/assets",
    StaticFiles(directory=BASE_DIR / "assets"),
    name="assets"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}

@app.get("/about")
def about():
    return {
        "name": "Deborah",
        "role": "Backend Developer in training"
    }

@app.get("/hello/{name}")
def say_hello(name: str):
    return {
        "name": name,
        "length": len(name)
    }

@app.get("/square/{number}")
def square(number: int):
    return {
        "number": number,
        "square": number * number
    }


@app.get("/books")
def get_books(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=5, ge=1, le=25),
    genre: str | None = None
):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("""
            SELECT b.book_id, b.book_name
            FROM books b
            WHERE (
                %s IS NULL
                OR EXISTS (
                    SELECT 1
                    FROM books_genres bg
                    JOIN genres g ON g.genre_id = bg.genre_id
                    WHERE bg.book_id = b.book_id
                    AND g.genre_name = %s
                )
            )
            ORDER BY b.book_id ASC
            LIMIT %s OFFSET %s
        """, (genre, genre, limit, offset))

        books = cursor.fetchall()

        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM books b
            WHERE (
                %s IS NULL
                OR EXISTS (
                    SELECT 1
                    FROM books_genres bg
                    JOIN genres g ON g.genre_id = bg.genre_id
                    WHERE bg.book_id = b.book_id
                    AND g.genre_name = %s
                )
            )
        """, (genre, genre))

        total = cursor.fetchone()["total"]

        return {
            "genre": genre,
            "offset": offset,
            "limit": limit,
            "total": total,
            "books": books
        }

    finally:
        cursor.close()
        connection.close()

@app.get("/books/{book_id}")
def get_book(book_id: int):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            # 1. Retrieve the main book information
            cursor.execute("""
                SELECT
                    book_id,
                    book_name,
                    isbn13,
                    first_publication_date,
                    url_file,
                    cover_image,
                    summary,
                    shortsummary
                FROM books
                WHERE book_id = %s
            """, (book_id,))

            book = cursor.fetchone()

            # Check whether the book exists
            if book is None:
                raise HTTPException(
                    status_code=404,
                    detail="Book not found"
                )

            # 2. Retrieve the authors
            cursor.execute("""
                SELECT
                    a.author_id,
                    a.full_name,
                    a.ISO3,
                    a.summary
                FROM authors a
                INNER JOIN books_authors ba
                    ON a.author_id = ba.author_id
                WHERE ba.book_id = %s
            """, (book_id,))

            book["authors"] = cursor.fetchall()

            # 3. Retrieve the genres
            cursor.execute("""
                SELECT
                    g.genre_id,
                    g.genre_name
                FROM genres g
                INNER JOIN books_genres bg
                    ON g.genre_id = bg.genre_id
                WHERE bg.book_id = %s
            """, (book_id,))

            book["genres"] = cursor.fetchall()

            return book

    finally:
        connection.close()


@app.get("/genres")
def get_genres():
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("""
            SELECT genre_id, genre_name
            FROM genres
            ORDER BY genre_name ASC
        """)

        genres = cursor.fetchall()

        return {"genres": genres}

    finally:
        cursor.close()
        connection.close()