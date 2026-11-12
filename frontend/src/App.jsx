import { Routes, Route } from 'react-router-dom'

import MainLayout from './layouts/MainLayout'
import BooksPage from './pages/BooksPage'
import BookDetail from './pages/BookDetail'
import GenresPage from './pages/GenresPage'
import AuthorsPage from './pages/AuthorsPage'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>

        <Route path="/" element={<BooksPage />} />
        <Route path="/books/:bookId" element={<BookDetail />} />
        <Route path="/genres" element={<GenresPage />} />
        <Route path="/authors" element={<AuthorsPage />} />

      </Route>
    </Routes>
  )
}

export default App