import { Link } from 'react-router-dom'

function Author({ author }) {
  return (
    <Link to={`/authors/${author.author_id}`} className="grid-link">
      <article className="card author-card">
        <div className="card-content">
          <h3>{author.full_name}</h3>
          <span className="author-country">{author.ISO3}</span>
          <p>{author.summary || 'No information available.'}</p>
        </div>
      </article>
    </Link>
  )
}

export default Author