import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

function BookSearch() {
  // State variables
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Reference to the search bar, used to detect clicks outside it
  const searchRef = useRef(null)

  // Search the API whenever the query changes
  useEffect(() => {

    // Require at least 2 characters before searching
    if (query.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      setLoading(false)
      return
    }

    // Wait 300ms before sending the request (debouncing)
    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        setResults([])
        setIsOpen(true)

        // Build the API URL, encoding the search term for use in a URL
        const url = `http://127.0.0.1:8000/search?q=${encodeURIComponent(query.trim())}`

        // Send the request to the FastAPI backend
        const response = await fetch(url)

        // Check whether the HTTP request was successful
        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`)
        }

        // Convert the JSON response into a JavaScript object
        const data = await response.json()

        // Save the search results in React state
        setResults(data.results)

      } catch (error) {
        // Handle errors, such as a failed request or unavailable server
        console.error('Search error:', error)
        setResults([])

      } finally {
        // Stop displaying the loading message
        setLoading(false)
      }
    }, 300)

    // Cancel the pending timeout if the query changes before 300ms
    return () => {
      clearTimeout(timer)
    }

  }, [query])


  // Close the dropdown when the user clicks outside the search bar
  useEffect(() => {

    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    // Remove the event listener when the component is unmounted
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }

  }, [])


  // Update the search query when the user types
  function handleInputChange(event) {
    const value = event.target.value

    setQuery(value)
    setIsOpen(value.trim().length >= 2)
  }


  // Open the dropdown when the search button is clicked
  function handleSearchClick() {
    if (query.trim().length >= 2) {
      setIsOpen(true)
    }
  }


  return (
    <div className="search-bar" ref={searchRef}>

      <input
        type="search"
        placeholder="Search books, authors..."
        aria-label="Search books and authors"
        value={query}
        onChange={handleInputChange}
        onFocus={() => {
          if (query.trim().length >= 2) {
            setIsOpen(true)
          }
        }}
      />

      <button
        type="button"
        className="search-button"
        aria-label="Search"
        onClick={handleSearchClick}
      >
        &#128269;
      </button>

      {/* Display the dropdown only when it is open and the query has at least 2 characters */}
      {isOpen && query.trim().length >= 2 && (
        <div className="search-results">

          {/* Loading message */}
          {loading && (
            <p className="search-message">Searching...</p>
          )}

          {/* Message displayed when the search returns no results */}
          {!loading && results.length === 0 && (
            <p className="search-message">No results found.</p>
          )}

          {/* Display one clickable result for each matching book */}
          {!loading && results.map((book) => (
            <Link
              to={`/books/${book.book_id}`}
              className="search-result"
              key={book.book_id}
              onClick={() => setIsOpen(false)}
            >
              <img
                src={`http://127.0.0.1:8000/${book.cover_image}`}
                alt={book.book_name}
              />

              <div className="search-result-info">
                <h4>{book.book_name}</h4>
                <p>{book.authors || 'Unknown author'}</p>
              </div>
            </Link>
          ))}

        </div>
      )}

    </div>
  )
}

export default BookSearch