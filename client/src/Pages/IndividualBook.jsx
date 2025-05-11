import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaHeart, FaComment } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './IndividualBook.css';

const IndividualBook = () => {
    const navigate = useNavigate();
    const { bookId } = useParams();
    const [feedback, setFeedback] = useState('');

    const handleSimilarBookClick = (bookId) => {
        navigate(`/book/${bookId}`);
    };

    const handleFeedbackSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the feedback to your backend
        console.log('Feedback submitted:', feedback);
        setFeedback(''); // Clear the text area after submission
    };

    const book = {
        id: bookId,
        title: "The Great Adventure",
        author: "John Smith",
        price: 29.99,
        rating: 4.5,
        genre: "Adventure",
        description: "Embark on an epic journey through uncharted territories in this thrilling adventure novel. Follow the protagonist as they face numerous challenges, discover hidden treasures, and encounter fascinating characters along the way. A masterpiece of storytelling that will keep you on the edge of your seat from beginning to end.",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        publishedDate: "2023",
        pages: 320,
        language: "English",
        isbn: "978-3-16-148410-0"
    };

    const similarBooks = [
        {
            id: 1,
            title: "Mystery House",
            price: 24.99,
            rating: 4.2,
            image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        },
        {
            id: 2,
            title: "Future World",
            price: 34.99,
            rating: 4.8,
            image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        },
        {
            id: 3,
            title: "Lost in Time",
            price: 27.99,
            rating: 4.0,
            image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        },
        {
            id: 4,
            title: "The Hidden Truth",
            price: 31.99,
            rating: 4.7,
            image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        }
    ];

    return (
        <div className="container py-5">
            <div className="row">
                {/* Book Details Section */}
                <div className="col-md-4">
                    <div className="book-image-container mb-4">
                        <img 
                            src={book.image} 
                            alt={book.title} 
                            className="img-fluid rounded shadow"
                        />
                    </div>
                </div>
                <div className="col-md-8">
                    <div className="book-details">
                        <h1 className="book-title mb-3">{book.title}</h1>
                        <h4 className="book-author text-muted mb-4">by {book.author}</h4>
                        
                        <div className="book-meta mb-4">
                            <div className="d-flex align-items-center mb-2">
                                <span className="price me-4">${book.price}</span>
                                <div className="rating d-flex align-items-center">
                                    <FaStar className="text-warning me-1" />
                                    <span>{book.rating}</span>
                                </div>
                            </div>
                            <div className="book-info">
                                <p><strong>Genre:</strong> {book.genre}</p>
                                <p><strong>Published:</strong> {book.publishedDate}</p>
                                <p><strong>Pages:</strong> {book.pages}</p>
                                <p><strong>Language:</strong> {book.language}</p>
                                <p><strong>ISBN:</strong> {book.isbn}</p>
                            </div>
                        </div>

                        <div className="book-description mb-4">
                            <h5>Description</h5>
                            <p>{book.description}</p>
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
            <div className="similar-books mt-5">
                <h2 className="mb-4">Similar Books</h2>
                <div className="row g-4">
                    {similarBooks.map(book => (
                        <div key={book.id} className="col-md-3">
                            <div 
                                className="card h-100 book-card"
                                onClick={() => handleSimilarBookClick(book.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="book-image-container">
                                    <img 
                                        src={book.image} 
                                        alt={book.title} 
                                        className="book-image"
                                    />
                                </div>
                                <div className="card-body">
                                    <h5 className="card-title">{book.title}</h5>
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <span className="price">${book.price}</span>
                                        <div className="rating">
                                            <FaStar className="text-warning" />
                                            <span className="ms-1">{book.rating}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

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