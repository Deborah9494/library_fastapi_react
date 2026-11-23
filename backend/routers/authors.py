from fastapi import APIRouter, HTTPException

from database import get_connection


router = APIRouter(
    prefix="/authors",
    tags=["Authors"]
)


# GET /authors
# Retrieve all authors
@router.get("")
def get_authors():

    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            cursor.execute("""
                SELECT
                    a.author_id,
                    a.full_name,
                    a.ISO3,
                    a.summary
                FROM authors a
                ORDER BY a.full_name ASC
            """)

            authors = cursor.fetchall()

            return {"authors": authors}

    finally:
        connection.close()


# GET /authors/{author_id}
# Retrieve an author with their books organised by series
@router.get("/{author_id}")
def get_author(author_id: int):

    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            # 1. Retrieve the author information
            cursor.execute("""
                SELECT
                    a.author_id,
                    a.full_name,
                    a.ISO3,
                    a.summary
                FROM authors a
                WHERE a.author_id = %s
            """, (author_id,))

            author = cursor.fetchone()

            # Check whether the author exists
            if author is None:
                raise HTTPException(
                    status_code=404,
                    detail="Author not found"
                )

            # 2. Retrieve the author's books and series information
            cursor.execute("""
                SELECT
                    b.book_id,
                    b.book_name,
                    b.cover_image,
                    b.shortsummary,
                    bs.series_id,
                    bs.series_order,
                    s.series_name,
                    s.series_description
                FROM books b
                INNER JOIN books_authors ba
                    ON b.book_id = ba.book_id
                LEFT JOIN books_series bs
                    ON b.book_id = bs.book_id
                LEFT JOIN series s
                    ON bs.series_id = s.series_id
                WHERE ba.author_id = %s
                ORDER BY
                    s.series_name ASC,
                    bs.series_order ASC,
                    b.book_name ASC
            """, (author_id,))

            books = cursor.fetchall()

            # 3. Organise the books into series and standalone books
            series_dict = {}
            standalone_books = []

            for book in books:

                # Books without a series
                if book["series_id"] is None:

                    standalone_books.append({
                        "book_id": book["book_id"],
                        "book_name": book["book_name"],
                        "cover_image": book["cover_image"],
                        "shortsummary": book["shortsummary"]
                    })

                # Books belonging to a series
                else:
                    series_id = book["series_id"]

                    # Create the series entry if it doesn't exist yet
                    if series_id not in series_dict:
                        series_dict[series_id] = {
                            "series_id": series_id,
                            "series_name": book["series_name"],
                            "series_description": book["series_description"],
                            "books": []
                        }

                    # Add the current book to its series
                    series_dict[series_id]["books"].append({
                        "book_id": book["book_id"],
                        "book_name": book["book_name"],
                        "cover_image": book["cover_image"],
                        "shortsummary": book["shortsummary"],
                        "series_order": book["series_order"]
                    })

            # 4. Add the organised collections to the author
            author["series"] = list(series_dict.values())
            author["standalone_books"] = standalone_books

            return author

    finally:
        connection.close()