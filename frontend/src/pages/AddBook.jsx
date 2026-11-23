import { useEffect, useMemo, useState } from 'react'
import { Link,useParams } from 'react-router-dom'

function AddBook() {
  const { bookId } = useParams()
  const isEditMode = Boolean(bookId)
  // Book information
  const [formData, setFormData] = useState({
    book_name: '',
    isbn13: '',
    first_publication_date: '',
    summary: '',
    shortsummary: '',
    series_id: '',
    series_order: ''
  })

  // Authors, series and genres retrieved from the API
  const [authors, setAuthors] = useState([])
  const [genres, setGenres] = useState([])
  const [series, setSeries] = useState([])

  // Selected authors and genres
  const [selectedAuthors, setSelectedAuthors] = useState([])
  const [selectedGenres, setSelectedGenres] = useState([])

  // Search fields for authors and genres
  const [authorSearch, setAuthorSearch] = useState('')
  const [genreSearch, setGenreSearch] = useState('')

  // Uploaded files
  const [coverFile, setCoverFile] = useState(null)
  const [epubFile, setEpubFile] = useState(null)
  // Existing files retrieved from the API
    const [existingCover, setExistingCover] = useState('')
    const [existingEpub, setExistingEpub] = useState('')

  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Cover image preview
    const [coverPreview, setCoverPreview] = useState('')

    // Form submission
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    // Store the ID once the book has been created
    const [createdBookId, setCreatedBookId] = useState(null)
    const [submissionComplete, setSubmissionComplete] = useState(false)

    useEffect(() => {
    async function fetchOptions() {
        try {
        const [authorsResponse, genresResponse, seriesResponse] =
            await Promise.all([
            fetch('http://127.0.0.1:8000/authors'),
            fetch('http://127.0.0.1:8000/genres'),
            fetch('http://127.0.0.1:8000/series')
            ])

        if (
            !authorsResponse.ok ||
            !genresResponse.ok ||
            !seriesResponse.ok
        ) {
            throw new Error('Unable to retrieve form options.')
        }

        const authorsData = await authorsResponse.json()
        const genresData = await genresResponse.json()
        const seriesData = await seriesResponse.json()

        setAuthors(authorsData.authors)
        setGenres(genresData.genres)
        setSeries(seriesData.series)

        } catch (error) {
        setError(error.message)

        } finally {
        setLoading(false)
        }
    }

    fetchOptions()
    }, [])

    useEffect(() => {
  if (!isEditMode) {
    return
  }

    async function fetchBook() {
        try {
        setLoading(true)
        setError('')

        const response = await fetch(
            `http://127.0.0.1:8000/books/${bookId}`
        )

        if (!response.ok) {
            throw new Error('Unable to retrieve the book.')
        }

        const book = await response.json()

        // Populate the book information
        setFormData({
            book_name: book.book_name,
            isbn13: book.isbn13,
            first_publication_date: book.first_publication_date,
            summary: book.summary,
            shortsummary: book.shortsummary,
            series_id: book.series?.series_id ?? '',
            series_order: book.series?.series_order ?? ''
        })

        // Preselect existing authors
        setSelectedAuthors(
            book.authors.map(author => author.author_id)
        )

        // Preselect existing genres
        setSelectedGenres(
            book.genres.map(genre => genre.genre_id)
        )

        setExistingCover(book.cover_image || '')
        setExistingEpub(book.url_file || '')

        } catch (error) {
        setError(error.message)

        } finally {
        setLoading(false)
        }
    }

    fetchBook()
    }, [bookId, isEditMode])

  // Generate a temporary preview URL for the selected cover
    useEffect(() => {
    if (!coverFile) {
        setCoverPreview('')
        return
    }

    const previewUrl = URL.createObjectURL(coverFile)
    setCoverPreview(previewUrl)

    // Release the temporary URL when the image changes or the component unmounts
    return () => URL.revokeObjectURL(previewUrl)

    }, [coverFile])

  // Filter authors according to the search field
  const filteredAuthors = useMemo(() => {
    return authors.filter(author =>
      author.full_name.toLowerCase().includes(authorSearch.toLowerCase())
    )
  }, [authors, authorSearch])

  // Filter genres according to the search field
  const filteredGenres = useMemo(() => {
    return genres.filter(genre =>
      genre.genre_name.toLowerCase().includes(genreSearch.toLowerCase())
    )
  }, [genres, genreSearch])

  // Submit the book and upload its optional files
    async function handleSubmit(event) {
    event.preventDefault()

    setSubmitError('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
        // Check file sizes before sending anything
        if (coverFile && coverFile.size > 5 * 1024 * 1024) {
        throw new Error('The cover image must not exceed 5 MB.')
        }

        if (epubFile && epubFile.size > 50 * 1024 * 1024) {
        throw new Error('The EPUB file must not exceed 50 MB.')
        }

        let bookId = createdBookId

        // STEP 1: Create the book if it hasn't already been created
        if (!bookId) {
        const bookData = {
            ...formData,
            author_ids: selectedAuthors,
            genre_ids: selectedGenres
        }

        const response = await fetch('http://127.0.0.1:8000/books', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookData)
        })

        if (!response.ok) {
            const data = await response.json()
            throw new Error(data.detail || 'Unable to create the book.')
        }

        const data = await response.json()

        bookId = data.book_id
        setCreatedBookId(bookId)

        setSuccessMessage(`Book created successfully! ID: ${bookId}`)
        }

        // Collect any upload errors
        const uploadErrors = []

        // STEP 2: Upload the cover image, if selected
        if (coverFile) {
        const coverData = new FormData()
        coverData.append('file', coverFile)

        try {
            const response = await fetch(
            `http://127.0.0.1:8000/books/${bookId}/cover`,
            {
                method: 'POST',
                body: coverData
            }
            )

            if (!response.ok) {
            const data = await response.json()
            throw new Error(data.detail || 'Cover upload failed.')
            }
        } catch (error) {
            uploadErrors.push(`Cover image: ${error.message}`)
        }
        }

        // STEP 3: Upload the EPUB file, if selected
        if (epubFile) {
        const epubData = new FormData()
        epubData.append('file', epubFile)

        try {
            const response = await fetch(
            `http://127.0.0.1:8000/books/${bookId}/epub`,
            {
                method: 'POST',
                body: epubData
            }
            )

            if (!response.ok) {
            const data = await response.json()
            throw new Error(data.detail || 'EPUB upload failed.')
            }
        } catch (error) {
            uploadErrors.push(`EPUB file: ${error.message}`)
        }
        }

        // STEP 4: Report the result
        if (uploadErrors.length > 0) {
        setSubmitError(
            `The book was created, but some files could not be uploaded: ${uploadErrors.join(' ')} You can try submitting again to retry the uploads.`
        )
        } else {
        setSubmissionComplete(true)
        setSuccessMessage(`Book created successfully! ID: ${bookId}`)
        }

    } catch (error) {
        setSubmitError(error.message)

    } finally {
        setIsSubmitting(false)
    }
    }

  // Update book information fields
  function handleChange(event) {
    const { name, value } = event.target

    setFormData(previousData => ({
      ...previousData,
      [name]: value
    }))
  }

  // Add or remove an author from the selection
  function handleAuthorChange(authorId) {
    setSelectedAuthors(previous =>
      previous.includes(authorId)
        ? previous.filter(id => id !== authorId)
        : [...previous, authorId]
    )
  }

  // Add or remove a genre from the selection
  function handleGenreChange(genreId) {
    setSelectedGenres(previous =>
      previous.includes(genreId)
        ? previous.filter(id => id !== genreId)
        : [...previous, genreId]
    )
  }
  
  if (loading) {
    return <main className="main-content">Loading form data...</main>
  }

  if (error) {
    return <main className="main-content">{error}</main>
  }

  return (
    <main className="main-content">
      <section className="add-book-section">

        <h1 className="page-title">Add a Book</h1>

        <form className="add-book-form" onSubmit={handleSubmit}>

          {/* BOOK INFORMATION */}
          <div className="form-section">
            <h2>Book information</h2>

            <div className="form-group">
              <label htmlFor="book_name">Book title *</label>
              <input
                type="text"
                id="book_name"
                name="book_name"
                value={formData.book_name}
                onChange={handleChange}
                maxLength="200"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="isbn13">ISBN-13 *</label>
                <input
                  type="text"
                  id="isbn13"
                  name="isbn13"
                  value={formData.isbn13}
                  onChange={handleChange}
                  pattern="[0-9]{13}"
                  maxLength="13"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="first_publication_date">
                  First publication date *
                </label>
                <input
                  type="date"
                  id="first_publication_date"
                  name="first_publication_date"
                  value={formData.first_publication_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="summary">Summary *</label>
              <textarea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                rows="5"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="shortsummary">
                Short summary * (maximum 90 characters)
              </label>
              <input
                type="text"
                id="shortsummary"
                name="shortsummary"
                value={formData.shortsummary}
                onChange={handleChange}
                maxLength="90"
                required
              />
              <span className="character-count">
                {formData.shortsummary.length}/90
              </span>
            </div>
          </div>

          {/* AUTHORS */}
          <div className="form-section">
            <h2>Authors</h2>

            <input
              type="search"
              placeholder="Search authors..."
              value={authorSearch}
              onChange={event => setAuthorSearch(event.target.value)}
              className="selection-search"
            />

            <div className="selection-list">
              {filteredAuthors.map(author => (
                <label key={author.author_id} className="selection-option">
                  <input
                    type="checkbox"
                    checked={selectedAuthors.includes(author.author_id)}
                    onChange={() => handleAuthorChange(author.author_id)}
                  />
                  {author.full_name}
                </label>
              ))}

              {filteredAuthors.length === 0 && (
                <p>No authors found.</p>
              )}
            </div>

            <p className="selection-count">
              {selectedAuthors.length} author(s) selected
            </p>
          </div>

          {/* GENRES */}
          <div className="form-section">
            <h2>Genres</h2>

            <input
              type="search"
              placeholder="Search genres..."
              value={genreSearch}
              onChange={event => setGenreSearch(event.target.value)}
              className="selection-search"
            />

            <div className="selection-list">
              {filteredGenres.map(genre => (
                <label key={genre.genre_id} className="selection-option">
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre.genre_id)}
                    onChange={() => handleGenreChange(genre.genre_id)}
                  />
                  {genre.genre_name}
                </label>
              ))}

              {filteredGenres.length === 0 && (
                <p>No genres found.</p>
              )}
            </div>

            <p className="selection-count">
              {selectedGenres.length} genre(s) selected
            </p>
          </div>

          {/* FILES */}
          <div className="form-section">
            <h2>Files (optional)</h2>

            <div className="form-group">
              <label htmlFor="cover">Cover image (JPEG)</label>
              <input
                type="file"
                id="cover"
                accept=".jpg,.jpeg,image/jpeg"
                onChange={event => setCoverFile(event.target.files[0] || null)}
              />
              {(coverPreview || (isEditMode && existingCover)) && (
                <div className="cover-preview">
                    <img
                    src={
                        coverPreview ||
                        `http://127.0.0.1:8000/${existingCover}`
                    }
                    alt="Book cover preview"
                    />
                </div>
                )}
              {coverFile && <p>{coverFile.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="epub">EPUB file</label>
              <input
                type="file"
                id="epub"
                accept=".epub,application/epub+zip"
                onChange={event => setEpubFile(event.target.files[0] || null)}
              />
              {isEditMode && existingEpub && (
                <p className="existing-file">
                    Current EPUB: {' '}
                    <a
                    href={`http://127.0.0.1:8000/${existingEpub}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    View existing EPUB
                    </a>
                </p>
                )}
                {isEditMode && !existingEpub && (
                <p>No EPUB file uploaded.</p>
                )}
              {epubFile && <p>{epubFile.name}</p>}
            </div>
          </div>

        {/* FORM MESSAGES */}
        {submitError && (
        <div className="form-error">
            {submitError}
        </div>
        )}

        {successMessage && (
        <div className="form-success">
            {successMessage}
        </div>
        )}

        {/* FORM ACTIONS */}
        <div className="form-actions">

        <Link to="/" className="btn btn-secondary">
            Cancel
        </Link>

        {!submissionComplete && (
            <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            >
            {isSubmitting
                ? 'Submitting...'
                : createdBookId
                ? 'Retry file uploads'
                : 'Create Book'}
            </button>
        )}

        {submissionComplete && (
            <Link
            to={`/books/${createdBookId}`}
            className="btn btn-primary"
            >
            View Book
            </Link>
        )}

        </div>
        </form>
      </section>
    </main>
  )
}

export default AddBook