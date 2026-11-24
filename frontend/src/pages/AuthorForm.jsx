import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
function AuthorForm() {
    const { authorId } = useParams()
    const isEditMode = Boolean(authorId)
    // Author information
    const [formData, setFormData] = useState({
        full_name: '',
        ISO3: '',
        summary: ''
    })
    // Countries retrieved from the API
    const [countries, setCountries] = useState([])
    // Loading and error states
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    // Form submission
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [createdAuthorId, setCreatedAuthorId] = useState(null)
    const [submissionComplete, setSubmissionComplete] = useState(false)

    useEffect(() => {
    async function fetchData() {
        try {
        setLoading(true)
        setError('')

        // Retrieve countries
        const countriesResponse = await fetch(
            'http://127.0.0.1:8000/countries'
        )

        if (!countriesResponse.ok) {
            throw new Error('Unable to retrieve countries.')
        }

        const countriesData = await countriesResponse.json()
        setCountries(countriesData.countries)

        // Retrieve author information in edit mode
        if (isEditMode) {
            const authorResponse = await fetch(
            `http://127.0.0.1:8000/authors/${authorId}`
            )

            if (!authorResponse.ok) {
            throw new Error('Unable to retrieve the author.')
            }

            const author = await authorResponse.json()

            setFormData({
            full_name: author.full_name,
            ISO3: author.ISO3,
            summary: author.summary
            })
        }

        } catch (error) {
        setError(error.message)

        } finally {
        setLoading(false)
        }
    }

    fetchData()
    }, [authorId, isEditMode])

    async function handleSubmit(event) {
        event.preventDefault()

        setSubmitError('')
        setSuccessMessage('')
        setIsSubmitting(true)

        try {
            // Prepare author data
            const authorData = {
            full_name: formData.full_name,
            ISO3: formData.ISO3,
            summary: formData.summary
            }

            // Create or update the author
            const response = await fetch(
            isEditMode
                ? `http://127.0.0.1:8000/authors/${authorId}`
                : 'http://127.0.0.1:8000/authors',
            {
                method: isEditMode ? 'PUT' : 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(authorData)
            }
            )

            if (!response.ok) {
            const data = await response.json()

            throw new Error(
                data.detail || `Unable to ${isEditMode ? 'update' : 'create'} the author.`
            )
            }

            const data = await response.json()

            // Store the newly created author ID
            if (!isEditMode) {
            setCreatedAuthorId(data.author_id)
            }

            setSubmissionComplete(true)

            setSuccessMessage(
            isEditMode
                ? 'Author updated successfully!'
                : 'Author created successfully!'
            )

        } catch (error) {
            setSubmitError(error.message)

        } finally {
            setIsSubmitting(false)
        }
    }

    // Update author information fields
    function handleChange(event) {
        const { name, value } = event.target

        setFormData(previousData => ({
            ...previousData,
            [name]: value
        }))

        // Allow the user to submit again after modifying the form
        setSubmissionComplete(false)
        setSuccessMessage('')
    }
  
    if (loading) {
        return <main className="main-content">Loading form data...</main>
    }

    if (error) {
        return <main className="main-content">{error}</main>
    }

    return (
        <main className="main-content">
        <section className="add-author-section">

            <h1 className="page-title">
            {isEditMode ? 'Edit Author' : 'Add an Author'}
            </h1>

            <form className="add-author-form" onSubmit={handleSubmit}>

            {/* AUTHOR INFORMATION */}
            <div className="form-section">
                <h2>Author information</h2>

                <div className="form-group">
                <label htmlFor="full_name">Author full name *</label>
                <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    maxLength="200"
                    required
                />
                </div>

                <div className="form-group">
                <label htmlFor="summary">Summary *</label>
                <textarea
                    id="summary"
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Write a short biography of the author..."
                    required
                />
                </div>
                <div className="form-group">
                    <label htmlFor="ISO3">Country *</label>

                    <select
                        id="ISO3"
                        name="ISO3"
                        value={formData.ISO3}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a country</option>

                        {countries.map(country => (
                        <option key={country.ISO3} value={country.ISO3}>
                            {country.country_name}
                        </option>
                        ))}
                    </select>
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

            <Link to="/authors" className="btn btn-secondary">
            Cancel
            </Link>

            {!submissionComplete && (
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting
                    ? 'Saving...'
                    : isEditMode
                        ? 'Update Author'
                        : 'Create Author'}
                </button>
            )}

            {submissionComplete && (
                <Link
                to={`/authors/${isEditMode ? authorId : createdAuthorId}`}
                className="btn btn-primary"
                >
                View Author
                </Link>
            )}

            </div>
            </form>
        </section>
        </main>
    )
}

export default AuthorForm