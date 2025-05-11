import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaHeart, FaComment } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './IndividualBook.css';
import bookService from '../api/bookService';

const IndividualBook = () => {
    const navigate = useNavigate();
    const { bookId } = useParams();
    const [feedback, setFeedback] = useState('');
    const [book, setBook] = useState(null);
    const [similarBooks, setSimilarBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBookDetails();
        fetchSimilarBooks();
    }, [bookId]);

    const fetchBookDetails = async () => {
        try {
            setLoading(true);
            const data = await bookService.getBookById(bookId);
            setBook(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching book details:', error);
            setError('Failed to load book details. Please try again later.');
            setLoading(false);
        }
    };

    const fetchSimilarBooks = async () => {
        try {
            const data = await bookService.getAllBooks();
            // Filter out current book and limit to 4 books
            const filtered = data
                .filter(b => b.bookId !== bookId)
                .slice(0, 4);
            setSimilarBooks(filtered);
        } catch (error) {
            console.error('Error fetching similar books:', error);
        }
    };

    const handleSimilarBookClick = (bookId) => {
        navigate(`/book/${bookId}`);
    };

    const handleFeedbackSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the feedback to your backend
        console.log('Feedback submitted:', feedback);
        setFeedback(''); // Clear the text area after submission
    };

    // Display loading message
    if (loading) {
        return (
            <div className="container py-5 text-center">
                <h2>Loading book details...</h2>
            </div>
        );
    }

    // Display error message
    if (error) {
        return (
            <div className="container py-5 text-center">
                <h2 className="text-danger">{error}</h2>
                <button className="btn btn-primary mt-3" onClick={fetchBookDetails}>Try Again</button>
            </div>
        );
    }

    // If book is not found
    if (!book) {
        return (
            <div className="container py-5 text-center">
                <h2>Book not found</h2>
                <button className="btn btn-primary mt-3" onClick={() => navigate('/books')}>
                    Back to Books
                </button>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row">
                {/* Book Details Section */}
                <div className="col-md-4">
                    <div className="book-image-container mb-4">
                        <img 
                            src={book.imageUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"} 
                            alt={book.title} 
                            className="img-fluid rounded shadow"
                        />
                    </div>
                </div>
                <div className="col-md-8">
                    <div className="book-details">
                        <h1 className="book-title mb-3">{book.title}</h1>
                        <h4 className="book-author text-muted mb-4">by {book.author || 'Unknown Author'}</h4>
                        
                        <div className="book-meta mb-4">
                            <div className="d-flex align-items-center mb-2">
                                <span className="price me-4">${book.price || 'N/A'}</span>
                                <div className="rating d-flex align-items-center">
                                    <FaStar className="text-warning me-1" />
                                    <span>{book.rating || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="book-info">
                                <p><strong>Genre:</strong> {book.genre || 'N/A'}</p>
                                <p><strong>Published:</strong> {new Date(book.publicationDate).getFullYear() || 'N/A'}</p>
                                <p><strong>Pages:</strong> {book.pages || 'N/A'}</p>
                                <p><strong>Language:</strong> {book.language || 'N/A'}</p>
                                <p><strong>ISBN:</strong> {book.isbn || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="book-description mb-4">
                            <h5>Description</h5>
                            <p>{book.description || 'No description available'}</p>
                        </div>

                        <div className="book-actions d-flex gap-3">
                            <button className="btn btn-primary">
                                <FaShoppingCart className="me-2" />
                                Add to Cart
                            </button>
                            <button className="btn btn-outline-danger">
                                <FaHeart className="me-2" />
                                Add to Wishlist
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar Books Section */}
            {similarBooks.length > 0 && (
                <div className="similar-books mt-5">
                    <h2 className="mb-4">Similar Books</h2>
                    <div className="row g-4">
                        {similarBooks.map(book => (
                            <div key={book.bookId} className="col-md-3">
                                <div 
                                    className="card h-100 book-card"
                                    onClick={() => handleSimilarBookClick(book.bookId)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="book-image-container">
                                        <img 
                                            src={book.imageUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"} 
                                            alt={book.title} 
                                            className="book-image"
                                        />
                                    </div>
                                    <div className="card-body">
                                        <h5 className="card-title">{book.title}</h5>
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <span className="price">${book.price || 'N/A'}</span>
                                            <div className="rating">
                                                <FaStar className="text-warning" />
                                                <span className="ms-1">{book.rating || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Feedback Section */}
            <div className="feedback-section mt-5">
                <h2 className="mb-4">
                    <FaComment className="me-2" />
                    Share Your Thoughts
                </h2>
                <div className="card">
                    <div className="card-body">
                        <form onSubmit={handleFeedbackSubmit}>
                            <div className="mb-3">
                                <label htmlFor="feedback" className="form-label">
                                    What do you think about this book?
                                </label>
                                <textarea
                                    className="form-control"
                                    id="feedback"
                                    rows="4"
                                    placeholder="Share your thoughts, reviews, or suggestions..."
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="d-flex justify-content-end">
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={!feedback.trim()}
                                >
                                    Submit Feedback
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IndividualBook;