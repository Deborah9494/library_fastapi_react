from fastapi import APIRouter, HTTPException

from database import get_connection


router = APIRouter(
    prefix="/genres",
    tags=["Genres"]
)


# GET /genres
# Retrieve all genres
@router.get("")
def get_genres():

    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            cursor.execute("""
                SELECT
                    genre_id,
                    genre_name
                FROM genres
                ORDER BY genre_name ASC
            """)

            genres = cursor.fetchall()

            return {"genres": genres}

    finally:
        connection.close()


# GET /genres/{genre_id}
# Retrieve a genre and all its books
@router.get("/{genre_id}")
def get_genre(genre_id: int):

    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            # 1. Retrieve the genre information
            cursor.execute("""
                SELECT
                    genre_id,
                    genre_name
                FROM genres
                WHERE genre_id = %s
            """, (genre_id,))

            genre = cursor.fetchone()

            # Check whether the genre exists
            if genre is None:
                raise HTTPException(
                    status_code=404,
                    detail="Genre not found"
                )

            # 2. Retrieve all books belonging to this genre
            cursor.execute("""
                SELECT
                    b.book_id,
                    b.book_name,
                    b.cover_image,
                    b.shortsummary
                FROM books b
                INNER JOIN books_genres bg
                    ON b.book_id = bg.book_id
                WHERE bg.genre_id = %s
                ORDER BY b.book_name ASC
            """, (genre_id,))

            genre["books"] = cursor.fetchall()

            return genre

    finally:
        connection.close()