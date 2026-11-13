import { Link } from 'react-router-dom'

function Genre({ genre }) {
  return (
    <Link to={`/genres/${genre.genre_id}`} className="grid-link">
      <article className="card">
        <div className="card-content">
          {genre.genre_name}
        </div>
      </article>
    </Link>
  )
}

export default Genre