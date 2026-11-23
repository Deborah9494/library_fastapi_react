import pymysql
from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from database import get_connection
from models.book import BookCreate
from pathlib import Path
from io import BytesIO
import zipfile

router = APIRouter(
    prefix="/books",
    tags=["Books"]
)

# Backend directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Maximum upload sizes
MAX_COVER_SIZE = 5 * 1024 * 1024       # 5 MB
MAX_EPUB_SIZE = 50 * 1024 * 1024       # 50 MB

# GET /books
# Retrieve books with pagination and optional genre filtering
@router.get("")
def get_books(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=5, ge=1, le=25),
    genre: str | None = None
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            # Retrieve the books
            cursor.execute("""
                SELECT
                    b.book_id,
                    b.book_name,
                    b.cover_image,
                    b.shortsummary
                FROM books b
                WHERE (
                    %s IS NULL
                    OR EXISTS (
                        SELECT 1
                        FROM books_genres bg
                        JOIN genres g
                            ON g.genre_id = bg.genre_id
                        WHERE bg.book_id = b.book_id
                        AND g.genre_name = %s
                    )
                )
                ORDER BY b.book_id ASC
                LIMIT %s OFFSET %s
            """, (genre, genre, limit, offset))

            books = cursor.fetchall()

            # Count the total number of matching books
            cursor.execute("""
                SELECT COUNT(*) AS total
                FROM books b
                WHERE (
                    %s IS NULL
                    OR EXISTS (
                        SELECT 1
                        FROM books_genres bg
                        JOIN genres g
                            ON g.genre_id = bg.genre_id
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
        connection.close()


# GET /books/{book_id}
# Retrieve a book with its authors and genres
@router.get("/{book_id}")
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

            # 4. Retrieve the series, if applicable
            cursor.execute("""
                SELECT
                    s.series_id,
                    s.series_name,
                    bs.series_order
                FROM books_series bs
                INNER JOIN series s
                    ON bs.series_id = s.series_id
                WHERE bs.book_id = %s
            """, (book_id,))

            book["series"] = cursor.fetchone()

            return book

    finally:
        connection.close()
        
# POST /books
# Create a book and its relationships
@router.post("", status_code=201)
def create_book(book: BookCreate):

    connection = get_connection()

    try:
        # Start a database transaction
        connection.begin()

        with connection.cursor() as cursor:

            # 1. Check that all selected authors exist
            if book.author_ids:

                author_ids = list(set(book.author_ids))

                placeholders = ", ".join(
                    ["%s"] * len(author_ids)
                )

                cursor.execute(
                    f"""
                    SELECT author_id
                    FROM authors
                    WHERE author_id IN ({placeholders})
                    """,
                    tuple(author_ids)
                )

                existing_authors = {
                    row["author_id"]
                    for row in cursor.fetchall()
                }

                missing_authors = set(author_ids) - existing_authors

                if missing_authors:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Authors not found: {sorted(missing_authors)}"
                    )

            # 2. Check that all selected genres exist
            if book.genre_ids:

                genre_ids = list(set(book.genre_ids))

                placeholders = ", ".join(
                    ["%s"] * len(genre_ids)
                )

                cursor.execute(
                    f"""
                    SELECT genre_id
                    FROM genres
                    WHERE genre_id IN ({placeholders})
                    """,
                    tuple(genre_ids)
                )

                existing_genres = {
                    row["genre_id"]
                    for row in cursor.fetchall()
                }

                missing_genres = set(genre_ids) - existing_genres

                if missing_genres:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Genres not found: {sorted(missing_genres)}"
                    )

            # 3. Check that the selected series exists
            if book.series_id is not None:

                cursor.execute("""
                    SELECT series_id
                    FROM series
                    WHERE series_id = %s
                """, (book.series_id,))

                if cursor.fetchone() is None:
                    raise HTTPException(
                        status_code=400,
                        detail="Series not found"
                    )

            # 4. Insert the main book information
            cursor.execute("""
                INSERT INTO books (
                    book_name,
                    isbn13,
                    first_publication_date,
                    url_file,
                    cover_image,
                    summary,
                    shortsummary
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                book.book_name,
                book.isbn13,
                book.first_publication_date,
                "",
                "",
                book.summary,
                book.shortsummary
            ))

            # Retrieve the ID generated by MariaDB
            new_book_id = cursor.lastrowid

            # Generate the filenames using the new book ID
            cover_image = f"assets/images/{new_book_id:08d}.jpg"
            url_file = f"assets/books/{new_book_id:08d}.epub"

            # Store the generated filenames in the database
            cursor.execute("""
                UPDATE books
                SET cover_image = %s,
                    url_file = %s
                WHERE book_id = %s
            """, (cover_image, url_file, new_book_id))

            # 5. Connect the book to its authors
            if book.author_ids:

                cursor.executemany("""
                    INSERT INTO books_authors (
                        book_id,
                        author_id
                    )
                    VALUES (%s, %s)
                """, [
                    (new_book_id, author_id)
                    for author_id in set(book.author_ids)
                ])

            # 6. Connect the book to its genres
            if book.genre_ids:

                cursor.executemany("""
                    INSERT INTO books_genres (
                        book_id,
                        genre_id
                    )
                    VALUES (%s, %s)
                """, [
                    (new_book_id, genre_id)
                    for genre_id in set(book.genre_ids)
                ])

            # 7. Connect the book to its series, if applicable
            if book.series_id is not None:

                cursor.execute("""
                    INSERT INTO books_series (
                        book_id,
                        series_id,
                        series_order
                    )
                    VALUES (%s, %s, %s)
                """, (
                    new_book_id,
                    book.series_id,
                    book.series_order
                ))

        # Save all changes
        connection.commit()

        return {
            "message": "Book created successfully",
            "book_id": new_book_id
        }

    except HTTPException:
        connection.rollback()
        raise

    except pymysql.err.IntegrityError as error:
        connection.rollback()

        raise HTTPException(
            status_code=409,
            detail=(
                "The book could not be created because it conflicts "
                "with an existing record or database constraint."
            )
        ) from error

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()

@router.post("/{book_id}/cover")
def upload_book_cover(book_id: int, file: UploadFile = File(...)):

    connection = get_connection()

    try:
        # Check whether the book exists and retrieve its cover path
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT cover_image FROM books WHERE book_id = %s",
                (book_id,)
            )
            book = cursor.fetchone()

        if not book:
            raise HTTPException(status_code=404, detail="Book not found")

        cover_path = book["cover_image"]
        expected_path = f"assets/images/{book_id:08d}.jpg"

        if cover_path != expected_path:
            raise HTTPException(
                status_code=500,
                detail="Invalid cover image path in database"
            )

        # Read the uploaded file
        file_content = file.file.read(MAX_COVER_SIZE + 1)

        # Check file size
        if len(file_content) > MAX_COVER_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Cover image must not exceed 5 MB"
            )

        # Validate JPEG format using its file signature
        if not file_content.startswith(b"\xff\xd8\xff"):
            raise HTTPException(
                status_code=400,
                detail="Only JPEG images are accepted"
            )

        # Build the physical file path
        destination = BASE_DIR / cover_path

        # Create the directory if it doesn't exist
        destination.parent.mkdir(parents=True, exist_ok=True)

        # Save the image
        destination.write_bytes(file_content)

        return {
            "message": "Cover image uploaded successfully",
            "book_id": book_id,
            "cover_image": cover_path
        }

    finally:
        connection.close()

@router.post("/{book_id}/epub")
def upload_book_epub(book_id: int, file: UploadFile = File(...)):

    connection = get_connection()

    try:
        # Check whether the book exists and retrieve its EPUB path
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT url_file FROM books WHERE book_id = %s",
                (book_id,)
            )
            book = cursor.fetchone()

        if not book:
            raise HTTPException(status_code=404, detail="Book not found")

        epub_path = book["url_file"]
        expected_path = f"assets/books/{book_id:08d}.epub"

        if epub_path != expected_path:
            raise HTTPException(
                status_code=500,
                detail="Invalid EPUB path in database"
            )

        # Read the uploaded file
        file_content = file.file.read(MAX_EPUB_SIZE + 1)

        # Check file size
        if len(file_content) > MAX_EPUB_SIZE:
            raise HTTPException(
                status_code=413,
                detail="EPUB file must not exceed 50 MB"
            )

        # Validate EPUB archive
        try:
            with zipfile.ZipFile(BytesIO(file_content)) as epub:
                if "mimetype" not in epub.namelist():
                    raise HTTPException(
                        status_code=400,
                        detail="Invalid EPUB file"
                    )

                mimetype = epub.read("mimetype")

                if mimetype != b"application/epub+zip":
                    raise HTTPException(
                        status_code=400,
                        detail="Invalid EPUB file"
                    )

        except zipfile.BadZipFile:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is not a valid EPUB archive"
            )

        # Build the physical file path
        destination = BASE_DIR / epub_path

        # Create the directory if it doesn't exist
        destination.parent.mkdir(parents=True, exist_ok=True)

        # Save the EPUB
        destination.write_bytes(file_content)

        return {
            "message": "EPUB uploaded successfully",
            "book_id": book_id,
            "url_file": epub_path
        }

    finally:
        connection.close()

# PUT /books/{book_id}
# Update a book and its relationships
@router.put("/{book_id}")
def update_book(book_id: int, book: BookCreate):

    connection = get_connection()

    try:
        connection.begin()

        with connection.cursor() as cursor:

            # 1. Check that the book exists
            cursor.execute("""
                SELECT book_id
                FROM books
                WHERE book_id = %s
            """, (book_id,))

            if cursor.fetchone() is None:
                raise HTTPException(
                    status_code=404,
                    detail="Book not found"
                )

            # 2. Check that all selected authors exist
            author_ids = list(set(book.author_ids))

            if author_ids:
                placeholders = ", ".join(["%s"] * len(author_ids))

                cursor.execute(
                    f"""
                    SELECT author_id
                    FROM authors
                    WHERE author_id IN ({placeholders})
                    """,
                    tuple(author_ids)
                )

                existing_authors = {
                    row["author_id"] for row in cursor.fetchall()
                }

                missing_authors = set(author_ids) - existing_authors

                if missing_authors:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Authors not found: {sorted(missing_authors)}"
                    )

            # 3. Check that all selected genres exist
            genre_ids = list(set(book.genre_ids))

            if genre_ids:
                placeholders = ", ".join(["%s"] * len(genre_ids))

                cursor.execute(
                    f"""
                    SELECT genre_id
                    FROM genres
                    WHERE genre_id IN ({placeholders})
                    """,
                    tuple(genre_ids)
                )

                existing_genres = {
                    row["genre_id"] for row in cursor.fetchall()
                }

                missing_genres = set(genre_ids) - existing_genres

                if missing_genres:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Genres not found: {sorted(missing_genres)}"
                    )

            # 4. Check that the selected series exists
            if book.series_id is not None:
                cursor.execute("""
                    SELECT series_id
                    FROM series
                    WHERE series_id = %s
                """, (book.series_id,))

                if cursor.fetchone() is None:
                    raise HTTPException(
                        status_code=400,
                        detail="Series not found"
                    )

            # 5. Update the main book information
            cursor.execute("""
                UPDATE books
                SET book_name = %s,
                    isbn13 = %s,
                    first_publication_date = %s,
                    summary = %s,
                    shortsummary = %s
                WHERE book_id = %s
            """, (
                book.book_name,
                book.isbn13,
                book.first_publication_date,
                book.summary,
                book.shortsummary,
                book_id
            ))

            # 6. Update author relationships
            cursor.execute("""
                DELETE FROM books_authors
                WHERE book_id = %s
            """, (book_id,))

            if author_ids:
                cursor.executemany("""
                    INSERT INTO books_authors (book_id, author_id)
                    VALUES (%s, %s)
                """, [
                    (book_id, author_id)
                    for author_id in author_ids
                ])

            # 7. Update genre relationships
            cursor.execute("""
                DELETE FROM books_genres
                WHERE book_id = %s
            """, (book_id,))

            if genre_ids:
                cursor.executemany("""
                    INSERT INTO books_genres (book_id, genre_id)
                    VALUES (%s, %s)
                """, [
                    (book_id, genre_id)
                    for genre_id in genre_ids
                ])

            # 8. Update series relationship
            cursor.execute("""
                DELETE FROM books_series
                WHERE book_id = %s
            """, (book_id,))

            if book.series_id is not None:
                cursor.execute("""
                    INSERT INTO books_series (
                        book_id,
                        series_id,
                        series_order
                    )
                    VALUES (%s, %s, %s)
                """, (
                    book_id,
                    book.series_id,
                    book.series_order
                ))

        # 9. Save changes
        connection.commit()

        return {
            "message": "Book updated successfully",
            "book_id": book_id
        }

    except HTTPException:
        connection.rollback()
        raise

    except pymysql.err.IntegrityError as error:
        connection.rollback()

        raise HTTPException(
            status_code=409,
            detail=(
                "The book could not be updated because it conflicts "
                "with an existing record or database constraint."
            )
        ) from error

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()
    
@router.delete("/{book_id}")
def delete_book(book_id: int):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            # Retrieve the book and its file paths
            cursor.execute(
                """
                SELECT cover_image, url_file
                FROM books
                WHERE book_id = %s
                """,
                (book_id,)
            )
            book = cursor.fetchone()

            if not book:
                raise HTTPException(status_code=404, detail="Book not found")

            # Delete the book from the database
            cursor.execute(
                "DELETE FROM books WHERE book_id = %s",
                (book_id,)
            )

        connection.commit()

        # Delete the cover image and EPUB from disk
        for file_path in (book["cover_image"], book["url_file"]):
            if file_path:
                file_path = BASE_DIR / file_path

                if file_path.is_file():
                    file_path.unlink()

        return {
            "message": "Book deleted successfully",
            "book_id": book_id
        }

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()