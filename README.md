# Easy Library

A full-stack web application for browsing and exploring a personal book collection.

Easy Library combines a **FastAPI backend**, a **React frontend**, and a **MariaDB database**. It is a personal project developed to practise full-stack web development and integrate Python, JavaScript and SQL technologies.

## Technologies

### Backend
- Python
- FastAPI
- PyMySQL
- MariaDB

### Frontend
- React
- JavaScript
- React Router
- HTML
- CSS
- Vite

## Current Features

- Retrieve books, authors and genres from a MariaDB database through a REST API.
- Browse the book collection.
- Display book covers served by FastAPI.
- Interactive 3D flip cards showing book titles and short summaries on hover.
- Navigate to individual book detail pages.
- Display detailed book information, including ISBN, publication date, summary, authors and genres.
- Filter books by genre.
- Navigate through books using pagination.
- Display genres dynamically from the API.
- Browse a dedicated Genres page and view individual genre details with their associated books.
- Browse a dedicated Authors page and view individual author details.
- Organise an author's books into series and standalone books.
- Display books within each series in their correct reading order.
- Navigate between related books, authors and genres.


## Project Structure

```text
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Author.jsx
│   │   │   ├── Book.jsx
│   │   │   └── Genre.jsx
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx
│   │   ├── pages/
│   │   │   ├── AuthorDetail.jsx
│   │   │   ├── AuthorsPage.jsx
│   │   │   ├── BookDetail.jsx
│   │   │   ├── BooksPage.jsx
│   │   │   ├── GenreDetail.jsx
│   │   │   └── GenresPage.jsx

```

## Getting Started

### Prerequisites

- Python 3.13+
- Node.js and npm
- MariaDB
- Git

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Set up the database

Create the database in MariaDB:

```sql
CREATE DATABASE books_v3;
```

Import the provided SQL backup:

```bash
mariadb -u root -p books_v3 < books_v3.sql
```

Create a database user and grant the necessary permissions:

```sql
CREATE USER 'books_app'@'localhost' IDENTIFIED BY 'your_password';

GRANT ALL PRIVILEGES ON books_v3.* TO 'books_app'@'localhost';

FLUSH PRIVILEGES;
```

Use your own secure password.

### 3. Configure environment variables

Navigate to the backend directory:

```bash
cd backend
```

Create your local environment file:

```bash
cp .env.example .env
```

Edit `.env` and enter your database credentials:

```env
DB_HOST=127.0.0.1
DB_USER=books_app
DB_PASSWORD=your_password
DB_NAME=books_v3
DB_PORT=3306
```

**Important:** The `.env` file contains local credentials and must never be committed to Git.

### 4. Start the backend

From the `backend` directory:

```bash
python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload
```

The API will be available at:

http://127.0.0.1:8000

Interactive API documentation:

http://127.0.0.1:8000/docs

### 5. Start the frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend

npm install
npm run dev
```

The application will be available at:

http://localhost:5173

## Future Improvements

- Add book search functionality.
- Implement book creation, editing and deletion.
- Add user authentication and personal user libraries.
- Improve responsive design and accessibility.

## About

Easy Library is an ongoing personal project focused on learning and practising full-stack web development using Python, FastAPI, React and MariaDB.