import { Routes, Route } from 'react-router-dom'

import MainLayout from './layouts/MainLayout'
import BooksPage from './pages/BooksPage'
import BookDetail from './pages/BookDetail'
import GenresPage from './pages/GenresPage'
import GenreDetail from './pages/GenreDetail'
import AuthorsPage from './pages/AuthorsPage'
import AuthorDetail from './pages/AuthorDetail'


function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>

        <Route path="/" element={<BooksPage />} />
        <Route path="/books/:bookId" element={<BookDetail />} />
        <Route path="/genres" element={<GenresPage />} />
        <Route path="/genres/:genreId" element={<GenreDetail />} />
        <Route path="/authors" element={<AuthorsPage />} />
        <Route path="/authors/:authorId" element={<AuthorDetail />} />

      </Route>
    </Routes>
  )
}

export default App