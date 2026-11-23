from fastapi import APIRouter
from database import get_connection

router = APIRouter(
    prefix="/series",
    tags=["Series"]
)


@router.get("")
def get_series():
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    series_id,
                    series_name,
                    series_description
                FROM series
                ORDER BY series_name
            """)

            return {
                "series": cursor.fetchall()
            }

    finally:
        connection.close()