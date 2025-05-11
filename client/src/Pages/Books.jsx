import React, { useState } from 'react';
import { FaSearch, FaStar, FaFilter, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Books.css';

const BookPage = () => {
    const navigate = useNavigate();
    const [visibleBooks, setVisibleBooks] = useState(4);
    const [books] = useState([
        { 
            id: 1, 
            name: "The Great Adventure", 
            price: 29.99, 
            rating: 4.5,
            image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        },
        { 
            id: 2, 
            name: "Mystery House", 
            price: 24.99, 
            rating: 4.2,
            image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        },
        { 
            id: 3, 
            name: "Future World", 
            price: 34.99, 
            rating: 4.8,
            image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        },
        { 
            id: 4, 
            name: "Lost in Time", 
            price: 27.99, 
            rating: 4.0,
            image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        },
        { 
            id: 5, 
            name: "The Hidden Truth", 
            price: 31.99, 
            rating: 4.7,
            image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        },
        { 
            id: 6, 
            name: "Eternal Love", 
            price: 26.99, 
            rating: 4.3,
            image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        },
        { 
            id: 7, 
            name: "Dark Secrets", 
            price: 29.99, 
            rating: 4.6,
            image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        },
        { 
            id: 8, 
            name: "Beyond the Stars", 
            price: 32.99, 
            rating: 4.4,
            image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        },
    ]);

    const handleViewMore = () => {
        setVisibleBooks(prev => prev + 4);
    };

    const handleBookClick = (bookId) => {
        navigate(`/book/${bookId}`);
    };

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

            <div className="row g-4">
                {books.slice(0, visibleBooks).map(book => (
                    <div key={book.id} className="col-md-3">
                        <div 
                            className="card h-100 book-card" 
                            onClick={() => handleBookClick(book.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="book-image-container">
                                <img 
                                    src={book.image} 
                                    alt={book.name} 
                                    className="book-image"
                                />
                            </div>
                            <div className="card-body">
                                <h5 className="card-title">{book.name}</h5>
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

            {visibleBooks < books.length && (
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