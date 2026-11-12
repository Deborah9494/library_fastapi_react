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

- Retrieve books from a MariaDB database through a REST API.
- Browse the book collection.
- Display book covers.
- Interactive 3D flip cards showing the book title and short summary on hover.
- Navigate to individual book detail pages.
- Display additional book information, including ISBN, publication date, summary, authors and genres.
- Filter books by genre.
- Navigate through books using pagination.
- Retrieve genres dynamically from the API.
- Display separate Genres and Authors pages.
- Serve book cover images through FastAPI.

## Project Structure

```text
FastAPI - React/
│
├── backend/
│   ├── assets/
│   │   └── images/
│   │       ├── 00000001.jpg
│   │       ├── 00000002.jpg
│   │       ├── ...
│   │       └── logo.png
│   │
│   ├── .env.example
│   ├── database.py
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── Book.jsx
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx
│   │   ├── pages/
│   │   │   ├── AuthorsPage.jsx
│   │   │   ├── BookDetail.jsx
│   │   │   ├── BooksPage.jsx
│   │   │   └── GenresPage.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── books_v3.sql
├── .gitignore
└── README.md
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

- Implement the Genres and Authors pages.
- Add book search functionality.
- Implement book creation, editing and deletion.
- Add user authentication.
- Improve responsive design.
- Expand the application with additional features.

## About

Easy Library is an ongoing personal project focused on learning and practising full-stack web development using Python, FastAPI, React and MariaDB.