# Easy Library

A full-stack web application for browsing and exploring a personal book collection.

The project combines a **FastAPI backend**, a **React frontend**, and a **MariaDB database**. It is being developed as a practical project to learn and integrate backend and frontend technologies.

## Technologies

### Backend
- Python
- FastAPI
- PyMySQL
- MariaDB

### Frontend
- React
- JavaScript
- HTML
- CSS
- Vite

## Current Features

- Retrieve books from a MariaDB database through a REST API.
- Browse the book collection.
- Filter books by genre.
- Navigate through books using pagination.
- Retrieve available genres dynamically from the API.
- Validate pagination parameters through FastAPI.

## Project Structure

```text
FastAPI - React/
│
├── backend/
│   ├── .env.example
│   ├── database.py
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── Book.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
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

Create your local environment file from the example:

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

**Important:** The `.env` file contains local credentials and should never be committed to Git.

### 4. Start the backend

From the `backend` directory:

```bash
python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload
```

The API will be available at:

`http://127.0.0.1:8000`

Interactive API documentation:

`http://127.0.0.1:8000/docs`

### 5. Start the frontend

Open another terminal:

```bash
cd frontend

npm install
npm run dev
```

The application will be available at:

`http://localhost:5173`

## Future Improvements

- Display book authors and genres.
- Add book cover images and descriptions.
- Implement book search.
- Add book details pages.
- Implement book creation, editing and deletion.
- Add user authentication.
- Improve the responsive design.

## About

Easy Library is an ongoing personal project focused on building a full-stack web application using Python, FastAPI, React and MariaDB.