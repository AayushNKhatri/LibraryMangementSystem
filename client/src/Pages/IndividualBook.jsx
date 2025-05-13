import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaHeart, FaComment, FaUser, FaTrash, FaEdit, FaCheckCircle } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './IndividualBook.css';
import bookService from '../api/bookService';
import reviewService from '../api/reviewService';
import bookmarkService from '../api/bookmarkService';
import { Modal, Button, Form, Toast, ToastContainer } from 'react-bootstrap';
import { BookLanguage, Genre } from '../utils/enums';


const IndividualBook = () => {
    const navigate = useNavigate();
    const { bookId } = useParams();
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [similarBooks, setSimilarBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentReviewId, setCurrentReviewId] = useState(null);
    const [editReviewText, setEditReviewText] = useState('');
    const [editReviewRating, setEditReviewRating] = useState(5);
    const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
    const [reviewSubmitError, setReviewSubmitError] = useState('');
    const [userId, setUserId] = useState(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');
    const [bookmarkLoading, setBookmarkLoading] = useState(false);
    const [isUserAdmin, setIsUserAdmin] = useState(false);

    useEffect(() => {
        // Set user ID from local storage
        const storedUserId = localStorage.getItem('authToken');
        if (storedUserId) {
            setUserId(storedUserId);
        }
        
        // Check if user is admin
        // setIsUserAdmin(isAdmin());
        
        fetchBookDetails();
        fetchSimilarBooks();
        fetchBookReviews();
    }, [bookId]);

    useEffect(() => {
        // Check if book is bookmarked when userId is available
        if (userId && bookId) {
            checkIfBookmarked();
        }
    }, [userId, bookId]);

    const fetchBookDetails = async () => {
        try {
            setLoading(true);
            const data = await bookService.getBookById(bookId);
            // Since the API returns a list, we need to find the book with matching ID
            const bookData = Array.isArray(data) ? data.find(b => b.bookId === bookId) : data;
            
            // Checking for image url
            if (bookData && bookData.imageUrl) {
                // Check if the URL already has parameters
                const separator = bookData.image.includes('?') ? '&' : '?';
                bookData.image = `${bookData.image}${separator}t=${new Date().getTime()}`;
                console.log(`The book does have imaage ${bookData.imageUrl}`);
            }
            
            console.log(bookData);
            setBook(bookData);
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
            // Try to match by genre if possible
            const currentBookGenre = book?.filters?.[0]?.genre;

            let filtered = data.filter(b => b.bookId !== bookId);

            // If we have the current book's genre, prioritize books with the same genre
            if (currentBookGenre !== undefined) {
                const sameGenreBooks = filtered.filter(b =>
                    b.filters &&
                    b.filters.length > 0 &&
                    b.filters[0].genre === currentBookGenre
                );

                if (sameGenreBooks.length >= 4) {
                    filtered = sameGenreBooks.slice(0, 4);
                } else {
                    // Not enough books in the same genre, add others
                    const otherBooks = filtered.filter(b =>
                        !b.filters ||
                        b.filters.length === 0 ||
                        b.filters[0].genre !== currentBookGenre
                    );
                    filtered = [...sameGenreBooks, ...otherBooks].slice(0, 4);
                }
            } else {
                // Just take any 4 books
                filtered = filtered.slice(0, 4);
            }
            
            // Add timestamp to image URLs to prevent caching
            filtered = filtered.map(book => {
                if (book.imageUrl) {
                    const separator = book.imageUrl.includes('?') ? '&' : '?';
                    book.imageUrl = `${book.imageUrl}${separator}t=${new Date().getTime()}`;
                }
                return book;
            });
            

            setSimilarBooks(filtered);
        } catch (error) {
            console.error('Error fetching similar books:', error);
        }
    };

    const fetchBookReviews = async () => {
        try {
            // Use the new endpoint to get reviews for this specific book
            const bookReviews = await reviewService.getReviewsByBook(bookId);
            console.log('Book reviews:', bookReviews);
            
            // Ensure we're handling both array and single object responses correctly
            if (bookReviews) {
                // If it's already an array, use it directly
                if (Array.isArray(bookReviews)) {
                    setReviews(bookReviews);
                } 
                // If it's a single review object (not an array), convert to array
                else if (bookReviews.reviewId) {
                    setReviews([bookReviews]);
                }
                // Otherwise, set empty array
                else {
                    setReviews([]);
                }
            } else {
                setReviews([]);
            }
        } catch (error) {
            console.error('Error fetching book reviews:', error);
            setReviews([]);
        }
    };


    const checkIfBookmarked = async () => {
        try {
            // Get all bookmarks for the user
            const bookmarks = await bookmarkService.getAllBookmarks();
            // Check if current book is bookmarked
            const isCurrentBookmarked = bookmarks.some(bookmark => bookmark.bookId === bookId);
            setIsBookmarked(isCurrentBookmarked);
        } catch (error) {
            console.error('Error checking if book is bookmarked:', error);
        }
    };

    const handleBookmark = async () => {
        if (!userId) {
            showToastNotification('Please log in to add this book to your wishlist', 'warning');
            return;
        }

        setBookmarkLoading(true);
        try {
            if (isBookmarked) {
                // Find the bookmark ID
                const bookmarks = await bookmarkService.getAllBookmarks();
                const bookmark = bookmarks.find(b => b.bookId === bookId);

                if (bookmark) {
                    await bookmarkService.removeBookmark(bookmark.bookmarkId);
                    setIsBookmarked(false);
                    showToastNotification('Book removed from your wishlist', 'success');
                }
            } else {
                await bookmarkService.addBookmark(bookId);
                setIsBookmarked(true);
                showToastNotification('Book added to your wishlist', 'success');
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            showToastNotification('Failed to update wishlist. Please try again.', 'danger');
        } finally {
            setBookmarkLoading(false);
        }
    };

    const showToastNotification = (message, type) => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    const handleSimilarBookClick = (bookId) => {
        navigate(`/book/${bookId}`);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!userId) {
            alert('Please log in to submit a review');
            return;
        }

        setIsReviewSubmitting(true);
        setReviewSubmitError('');

        try {
            const reviewData = {
                rating: parseInt(reviewRating),
                comment: reviewText
            };

            await reviewService.createReview(bookId, reviewData);

            // Clear form and refresh reviews
            setReviewText('');
            setReviewRating(5);
            fetchBookReviews();
        } catch (error) {
            console.error('Error submitting review:', error);
            setReviewSubmitError('Failed to submit review. Please try again.');
        } finally {
            setIsReviewSubmitting(false);
        }
    };

    const handleEditReview = (review) => {
        setCurrentReviewId(review.reviewId);
        setEditReviewText(review.comment);
        setEditReviewRating(review.rating);
        setShowEditModal(true);
    };

    const handleUpdateReview = async () => {
        try {
            const reviewData = {
                rating: parseInt(editReviewRating),
                comment: editReviewText
            };

            await reviewService.updateReview(currentReviewId, reviewData);
            setShowEditModal(false);
            fetchBookReviews();
        } catch (error) {
            console.error('Error updating review:', error);
            alert('Failed to update review. Please try again.');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await reviewService.deleteReview(reviewId);
                fetchBookReviews();
            } catch (error) {
                console.error('Error deleting review:', error);
                alert('Failed to delete review. Please try again.');
            }
        }
    };

    // Calculate average rating from reviews
    const calculateAverageRating = (reviews) => {
        if (!reviews || reviews.length === 0) return 'N/A';
        
        // Check if reviews is an array or an object with rating property
        if (Array.isArray(reviews)) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = (totalRating / reviews.length).toFixed(1);
            return averageRating;
        } else if (reviews.rating !== undefined) {
            // Handle case where reviews is an object with rating property
            return reviews.rating.toFixed(1);
        }
        
        return 'N/A';
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
            {/* Toast Notification */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1 }}>
                <Toast
                    onClose={() => setShowToast(false)}
                    show={showToast}
                    delay={3000}
                    autohide
                    bg={toastType}
                >
                    <Toast.Header>
                        <strong className="me-auto">Notification</strong>
                    </Toast.Header>
                    <Toast.Body className={toastType === 'danger' ? 'text-white' : ''}>
                        {toastMessage}
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <div className="row">
                {/* Book Details Section */}
                <div className="col-md-4">
                    <div className="book-image-container mb-4 position-relative">
                        <img 
                            src={book.image || book.imageUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"} 
                            alt={book.title} 
                            className="img-fluid rounded shadow"
                            onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
                            }}
                        />
                    </div>
                </div>
                <div className="col-md-8">
                    <div className="book-details">
                        <h1 className="book-title mb-3">{book.title}</h1>
                        <h4 className="book-author text-muted mb-4">by {book.author || 'Unknown Author'}</h4>

                        <div className="book-meta mb-4">
                            <div className="d-flex align-items-center mb-2">
                                <span className="price me-4">
                                    ${book.inventories?.[0]?.price || book.price || 'N/A'}
                                    {book.inventories?.[0]?.isOnSale && book.inventories?.[0]?.discountPercent > 0 && (
                                        <span className="ms-2 text-danger">
                                            ({book.inventories[0].discountPercent}% off)
                                        </span>
                                    )}
                                </span>
                                <div className="rating d-flex align-items-center">
                                    <FaStar className="text-warning me-1" />
                                    <span>{calculateAverageRating(reviews)}</span>
                                </div>
                            </div>
                            <div className="book-info">
                                {book.filters?.[0]?.genre !== undefined && (
                                    <p><strong>Genre:</strong> {Genre[book.filters[0].genre] || 'N/A'}</p>
                                )}
                                <p><strong>Published:</strong> {book.publicationDate ? new Date(book.publicationDate).getFullYear() : 'N/A'}</p>
                                <p><strong>Language:</strong> {BookLanguage[book.language] || 'N/A'}</p>
                                <p><strong>ISBN:</strong> {book.isbn || 'N/A'}</p>
                                <p><strong>Availability:</strong> {book.inventories?.[0]?.quantity > 0 ? `In Stock (${book.inventories[0].quantity} available)` : 'Out of Stock'}</p>
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
                            <button
                                className={`btn ${isBookmarked ? 'btn-danger' : 'btn-outline-danger'}`}
                                onClick={handleBookmark}
                                disabled={bookmarkLoading}
                            >
                                {bookmarkLoading ? (
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                ) : (
                                    isBookmarked ? <FaCheckCircle className="me-2" /> : <FaHeart className="me-2" />
                                )}
                                {isBookmarked ? 'In Wishlist' : 'Add to Wishlist'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="reviews-section mt-5">
                <h2 className="mb-4">
                    <FaStar className="me-2 text-warning" />
                    Customer Reviews
                </h2>

                {reviews.length > 0 ? (
                    <div className="reviews-list">
                        {reviews.map(review => (
                            <div key={review.reviewId} className="card mb-3">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <div className="d-flex align-items-center mb-2">
                                                <FaUser className="me-2" />
                                                <span className="fw-bold">{review.user?.userName || 'Anonymous'}</span>
                                            </div>
                                            <div className="mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar
                                                        key={i}
                                                        className={i < review.rating ? "text-warning" : "text-muted"}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {review.userId === userId && (
                                            <div>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleEditReview(review)}
                                                >
                                                    <FaEdit />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteReview(review.reviewId)}
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-3">{review.comment}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card mb-4">
                        <div className="card-body text-center">
                            <p className="mb-0">No reviews yet. Be the first to review this book!</p>
                        </div>
                    </div>
                )}

                {/* Submit Review Section */}
                <div className="submit-review-section mt-4">
                    <h3 className="mb-3">Write a Review</h3>
                    {!userId && (
                        <div className="alert alert-info">
                            Please <a href="/login">log in</a> to submit a review.
                        </div>
                    )}
                    <div className="card">
                        <div className="card-body">
                            <Form onSubmit={handleReviewSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Rating</Form.Label>
                                    <div className="d-flex">
                                        {[1, 2, 3, 4, 5].map(rating => (
                                            <div
                                                key={rating}
                                                className="rating-star p-2"
                                                style={{cursor: 'pointer'}}
                                                onClick={() => setReviewRating(rating)}
                                            >
                                                <FaStar
                                                    size={24}
                                                    className={rating <= reviewRating ? "text-warning" : "text-muted"}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Your Review</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        placeholder="Share your thoughts about this book..."
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        required
                                        disabled={!userId}
                                    />
                                </Form.Group>
                                {reviewSubmitError && (
                                    <div className="alert alert-danger">{reviewSubmitError}</div>
                                )}
                                <div className="d-flex justify-content-end">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={!reviewText.trim() || isReviewSubmitting || !userId}
                                    >
                                        {isReviewSubmitting ? 'Submitting...' : 'Submit Review'}
                                    </Button>
                                </div>
                            </Form>
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
                                            onError={(e) => {
                                                e.target.onerror = null; 
                                                e.target.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
                                            }}
                                        />
                                    </div>
                                    <div className="card-body">
                                        <h5 className="card-title">{book.title}</h5>
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <span className="price">${book.inventories?.[0]?.price || book.price || 'N/A'}</span>
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

            {/* Edit Review Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Your Review</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Rating</Form.Label>
                            <div className="d-flex">
                                {[1, 2, 3, 4, 5].map(rating => (
                                    <div
                                        key={rating}
                                        className="rating-star p-2"
                                        style={{cursor: 'pointer'}}
                                        onClick={() => setEditReviewRating(rating)}
                                    >
                                        <FaStar
                                            size={24}
                                            className={rating <= editReviewRating ? "text-warning" : "text-muted"}
                                        />
                                    </div>
                                ))}
                            </div>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Your Review</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={editReviewText}
                                onChange={(e) => setEditReviewText(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleUpdateReview}
                        disabled={!editReviewText.trim()}
                    >
                        Update Review
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default IndividualBook;
