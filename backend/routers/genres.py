from fastapi import APIRouter, HTTPException
from database import get_connection
from models.genre import GenreCreate, GenreUpdate
import pymysql

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

# POST /genres
# Create a new genre
@router.post("")
def create_genre(genre: GenreCreate):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            # 1. Insert the new genre
            cursor.execute("""
                INSERT INTO genres (
                    genre_name
                )
                VALUES (%s)
            """, (
                genre.genre_name
            ))
            # 3. Retrieve the generated genre ID
            new_genre_id = cursor.lastrowid
            connection.commit()
            return {
                "message": "Genre created successfully",
                "genre_id": new_genre_id
            }
    except HTTPException:
        connection.rollback()
        raise
    except pymysql.IntegrityError:
        connection.rollback()
        raise HTTPException(
            status_code=409,
            detail="A genre with this name already exists"
        )
    except Exception:
        connection.rollback()
        raise HTTPException(
            status_code=500,
            detail="An error occurred while creating the genre"
        )
    finally:
        connection.close()

# PUT /genres/{genre_id}
# Update an existing genre
@router.put("/{genre_id}")
def update_genre(genre_id: int, genre: GenreUpdate):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            # 1. Check whether the genre exists
            cursor.execute("""
                SELECT genre_id
                FROM genres
                WHERE genre_id = %s
            """, (genre_id,))
            existing_genre = cursor.fetchone()
            if existing_genre is None:
                raise HTTPException(
                    status_code=404,
                    detail="Genre not found"
                )
            # 2. Update the genre
            cursor.execute("""
                UPDATE genres
                SET
                    genre_name = %s
                WHERE genre_id = %s
            """, (
                genre.genre_name,
                genre_id
            ))
            connection.commit()
            return {
                "message": "Genre updated successfully",
                "genre_id": genre_id
            }
    except HTTPException:
        connection.rollback()
        raise
    except pymysql.IntegrityError:
        connection.rollback()
        raise HTTPException(
            status_code=409,
            detail="A genre with this name already exists"
        )
    except Exception:
        connection.rollback()
        raise HTTPException(
            status_code=500,
            detail="An error occurred while updating the genre"
        )
    finally:
        connection.close()

# DELETE /genres/{genre_id}
# Delete a genre
@router.delete("/{genre_id}")
def delete_genre(genre_id: int):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            # 1. Check whether the genre exists
            cursor.execute("""
                SELECT genre_id
                FROM genres
                WHERE genre_id = %s
            """, (genre_id,))
            existing_genre = cursor.fetchone()
            if existing_genre is None:
                raise HTTPException(
                    status_code=404,
                    detail="Genre not found"
                )
            # 2. Delete the genre
            cursor.execute("""
                DELETE FROM genres
                WHERE genre_id = %s
            """, (genre_id,))
            connection.commit()
            return {
                "message": "Genre deleted successfully",
                "genre_id": genre_id
            }
    except HTTPException:
        connection.rollback()
        raise
    except Exception:
        connection.rollback()
        raise HTTPException(
            status_code=500,
            detail="An error occurred while deleting the genre"
        )
    finally:
        connection.close()