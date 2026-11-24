import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Author from '../components/Author'

function AuthorsPage() {

  const [authors, setAuthors] = useState([])

  // Retrieve genres when the component loads
  useEffect(() => {
    fetch('http://127.0.0.1:8000/authors')
      .then(response => response.json())
      .then(data => setAuthors(data.authors))
      .catch(error => console.error('Error fetching authors:', error))
  }, [])

  return (
    <main className="main-content">
      <section className="grid-section">
        
        <div className="authors-header">
          <h1 className="page-title">Authors</h1>

          <div className="authors-actions">
            <Link to="/authors/new" className="btn btn-primary">
              + Add an Author
            </Link>
          </div>
        </div>
        

        {/* AUTHORS GRID */}
        <div className="grid">
          {authors.map((author) => (
            <Author key={author.author_id} author={author} />
          ))}
        </div>
      </section>     
    </main>
  )
}

export default AuthorsPage