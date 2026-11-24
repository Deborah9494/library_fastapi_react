from fastapi import APIRouter
from database import get_connection

router = APIRouter(
    prefix="/countries",
    tags=["Countries"]
)

# GET /countries
# Retrieve all countries
@router.get("")
def get_countries():
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    c.ISO3,
                    c.country_name
                FROM countries c
                ORDER BY c.country_name ASC
            """)

            countries = cursor.fetchall()
            return {"countries": countries}
    finally:
        connection.close()
