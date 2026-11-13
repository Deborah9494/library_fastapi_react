import { useState, useEffect } from 'react'
import Genre from '../components/Genre'

function GenresPage() {
  const [genres, setGenres] = useState([])

  // Retrieve genres when the component loads
  useEffect(() => {
    fetch('http://127.0.0.1:8000/genres')
      .then(response => response.json())
      .then(data => setGenres(data.genres))
      .catch(error => console.error('Error fetching genres:', error))
  }, [])

  return (
    <main className="main-content">
      <section className="grid-section">
        <h1 className="page-title">Genres</h1>
        {/* GENRES GRID */}
        <div className="grid">
          {genres.map((genre) => (
            <Genre key={genre.genre_id} genre={genre} />
          ))}
        </div>

      </section>
    </main>
  )
}

export default GenresPage