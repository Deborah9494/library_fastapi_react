import { Link } from 'react-router-dom'

function Genre({ genre }) {
  return (
    <Link to={`/genres/${genre.genre_id}`} className="grid-link">
      <article className="card genre-card">
        <div className="genre-card-content">
          <h3>{genre.genre_name}</h3>
        </div>
      </article>
    </Link>
  )
}

export default Genre