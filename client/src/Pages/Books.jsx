import React, { useState, useEffect } from 'react';
import { FaSearch, FaStar, FaFilter, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Books.css';
import bookService from '../api/bookService';

const BookPage = () => {
    const navigate = useNavigate();
    const [visibleBooks, setVisibleBooks] = useState(4);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const data = await bookService.getAllBooks();
            setBooks(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching books:', error);
            setError('Failed to load books. Please try again later.');
            setLoading(false);
        }
    };

    const handleViewMore = () => {
        setVisibleBooks(prev => prev + 4);
    };

    const handleBookClick = (bookId) => {
        navigate(`/book/${bookId}`);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter books based on search term
    const filteredBooks = books.filter(book => 
        book.title && book.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Display loading message
    if (loading) {
        return (
            <div className="container py-5 text-center">
                <h2>Loading books...</h2>
            </div>
        );
    }

    // Display error message
    if (error) {
        return (
            <div className="container py-5 text-center">
                <h2 className="text-danger">{error}</h2>
                <button className="btn btn-primary mt-3" onClick={fetchBooks}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h1 className="text-center mb-5">Our Books Collection</h1>

            <div className="search-filters-container mb-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="input-group mb-4">
                            <span className="input-group-text bg-white">
                                <FaSearch className="text-muted" />
                            </span>
                            <input 
                                type="search" 
                                className="form-control" 
                                placeholder="Search for your books"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>
                </div>
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="d-flex justify-content-center gap-3 filters-wrapper">
                            <div className="dropdown">
                                <button 
                                    className="btn btn-outline-secondary dropdown-toggle" 
                                    type="button" 
                                    data-bs-toggle="dropdown"
                                >
                                    <FaFilter className="me-2" />
                                    Categories
                                </button>
                                <ul className="dropdown-menu">
                                    <li><a className="dropdown-item" href="#">New Arrivals</a></li>
                                    <li><a className="dropdown-item" href="#">Best Sellers</a></li>
                                    <li><a className="dropdown-item" href="#">Featured</a></li>
                                </ul>
                            </div>

                            <div className="dropdown">
                                <button 
                                    className="btn btn-outline-secondary dropdown-toggle" 
                                    type="button" 
                                    data-bs-toggle="dropdown"
                                >
                                    <FaFilter className="me-2" />
                                    Genres
                                </button>
                                <ul className="dropdown-menu">
                                    <li><a className="dropdown-item" href="#">Comedy</a></li>
                                    <li><a className="dropdown-item" href="#">Horror</a></li>
                                    <li><a className="dropdown-item" href="#">Romance</a></li>
                                    <li><a className="dropdown-item" href="#">Sci-Fi</a></li>
                                </ul>
                            </div>

                            <div className="dropdown">
                                <button 
                                    className="btn btn-outline-secondary dropdown-toggle" 
                                    type="button" 
                                    data-bs-toggle="dropdown"
                                >
                                    <FaFilter className="me-2" />
                                    Format
                                </button>
                                <ul className="dropdown-menu">
                                    <li><a className="dropdown-item" href="#">Hard Copy</a></li>
                                    <li><a className="dropdown-item" href="#">Soft Copy</a></li>
                                    <li><a className="dropdown-item" href="#">E-Book</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {filteredBooks.length === 0 ? (
                <div className="text-center py-5">
                    <h3>No books found matching your search.</h3>
                </div>
            ) : (
                <div className="row g-4">
                    {filteredBooks.slice(0, visibleBooks).map(book => (
                        <div key={book.bookId} className="col-md-3">
                            <div 
                                className="card h-100 book-card" 
                                onClick={() => handleBookClick(book.bookId)}
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
            )}

            {visibleBooks < filteredBooks.length && (
                <div className="text-center mt-4">
                    <button 
                        className="btn btn-primary view-more-btn" 
                        onClick={handleViewMore}
                    >
                        View More <FaChevronRight className="ms-2" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default BookPage;