from pydantic import BaseModel, Field, field_validator

class GenreCreate(BaseModel):
    genre_name: str = Field(min_length=1, max_length=100)

    @field_validator("genre_name")
    @classmethod
    def validate_genre_name(cls, value):
        value = value.strip()

        if not value:
            raise ValueError("Genre name cannot be empty")

        return value


class GenreUpdate(GenreCreate):
    pass