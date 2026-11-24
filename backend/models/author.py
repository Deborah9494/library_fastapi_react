from pydantic import BaseModel, Field, field_validator


class AuthorCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=200)
    ISO3: str = Field(pattern=r"^[A-Z]{3}$")
    summary: str

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value):
        value = value.strip()

        if not value:
            raise ValueError("Author name cannot be empty")

        return value


class AuthorUpdate(AuthorCreate):
    pass