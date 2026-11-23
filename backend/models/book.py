from datetime import date
from pydantic import BaseModel, Field, model_validator

class BookCreate(BaseModel):
    book_name: str = Field(min_length=1, max_length=200)
    isbn13: str = Field(pattern=r"^\d{13}$")
    first_publication_date: date
    summary: str
    shortsummary: str = Field(min_length=1, max_length=90)

    author_ids: list[int] = Field(default_factory=list)
    genre_ids: list[int] = Field(default_factory=list)

    series_id: int | None = None
    series_order: int | None = None

    @model_validator(mode="after")
    def validate_series(self):
        if (self.series_id is None) != (self.series_order is None):
            raise ValueError("series_id and series_order must be provided together")

        if self.series_order is not None and not 1 <= self.series_order <= 255:
            raise ValueError("series_order must be between 1 and 255")

        return self