import React, { useState, useEffect } from 'react';
import { FaSearch, FaUser, FaBook, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Authors.css';
import filterService from '../api/FilterService';

const Authors = () => {
    const navigate = useNavigate();
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [noAuthorsFound, setNoAuthorsFound] = useState(false);

    useEffect(() => {
        fetchAuthors();
    }, []);

    const fetchAuthors = async () => {
        try {
            setLoading(true);
            setNoAuthorsFound(false);
            setError(null);
            const data = await filterService.getFilteredAuthors();
            console.log('Authors data:', data);
            setAuthors(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching authors:', error);
            
            // Check if this is the "no authors found" response (404 with specific message)
            if (error.response && 
                error.response.status === 404 && 
                error.response.data === "Sorry, we couldn't find the author you're looking for") {
                setNoAuthorsFound(true);
                setAuthors([]);
            } else {
                // Handle other errors
                let errorMessage = 'Failed to load authors. Please try again later.';
                
                if (error.response) {
                    errorMessage = `Server error: ${error.response.status}`;
                    console.error('Response data:', error.response.data);
                    console.error('Response status:', error.response.status);
                } else if (error.request) {
                    errorMessage = 'No response from server. Check if the backend is running.';
                    console.error('Request:', error.request);
                } else {
                    errorMessage = `Error: ${error.message}`;
                }
                
                setError(errorMessage);
            }
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter authors based on search term (using authorName instead of name)
    const filteredAuthors = authors.filter(author =>
        author.authorName && author.authorName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Display loading message
    if (loading) {
        return (
            <div className="container py-5 text-center">
                <h2>Loading authors...</h2>
            </div>
        );
    }

    // Display error message
    if (error) {
        return (
            <div className="container py-5 text-center">
                <h2 className="text-danger">Error</h2>
                <p className="mb-3">{error}</p>
                <button className="btn btn-primary" onClick={fetchAuthors}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h1 className="text-center mb-5">Our Authors</h1>

            <div className="search-container mb-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="input-group mb-4">
                            <span className="input-group-text bg-white">
                                <FaSearch className="text-muted" />
                            </span>
                            <input
                                type="search"
                                className="form-control"
                                placeholder="Search for authors"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {(noAuthorsFound || filteredAuthors.length === 0) ? (
                <div className="text-center py-5">
                    {noAuthorsFound ? (
                        <div>
                            <h3>No authors found in the database</h3>
                            <p className="text-muted mt-3">There are currently no authors in our library.</p>
                        </div>
                    ) : (
                        <h3>No authors found matching your search.</h3>
                    )}
                </div>
            ) : (
                <div className="row g-4">
                    {filteredAuthors.map(author => (
                        <div key={author.authorId} className="col-md-3">
                            <div className="card h-100 author-card">
                                <div className="card-body text-center">
                                    <div className="author-avatar mb-3">
                                        <FaUser size={48} className="text-primary" />
                                    </div>
                                    <h5 className="card-title">{author.authorName}</h5>
                                    {author.biography && (
                                        <p className="card-text small text-muted">
                                            {author.biography.length > 100 
                                              ? `${author.biography.substring(0, 100)}...` 
                                              : author.biography}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Authors; 