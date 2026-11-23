from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import books, genres, authors, series
from database import get_connection

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Serve static files, such as book cover images
app.mount(
    "/assets",
    StaticFiles(directory="assets"),
    name="assets"
)

# Register API routers
app.include_router(books.router)
app.include_router(genres.router)
app.include_router(authors.router)
app.include_router(series.router)

@app.get("/")
def home():
    return {"message": "Welcome to Easy Library API"}

@app.get("/search")
def search_books(q: str = Query(..., min_length=2, max_length=100)):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            search_term = f"%{q}%"

            cursor.execute("""
                SELECT
                    b.book_id,
                    b.book_name,
                    b.cover_image,
                    GROUP_CONCAT(
                        DISTINCT a.full_name
                        ORDER BY a.full_name
                        SEPARATOR ', '
                    ) AS authors
                FROM books b
                LEFT JOIN books_authors ba
                    ON b.book_id = ba.book_id
                LEFT JOIN authors a
                    ON ba.author_id = a.author_id
                WHERE
                    b.book_name LIKE %s
                    OR EXISTS (
                        SELECT 1
                        FROM books_authors ba2
                        INNER JOIN authors a2
                            ON ba2.author_id = a2.author_id
                        WHERE
                            ba2.book_id = b.book_id
                            AND a2.full_name LIKE %s
                    )
                GROUP BY
                    b.book_id,
                    b.book_name,
                    b.cover_image
                ORDER BY b.book_name ASC
            """, (search_term, search_term))

            results = cursor.fetchall()

            return {"results": results}

    finally:
        connection.close()