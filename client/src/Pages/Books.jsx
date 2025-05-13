import React, { useState, useEffect } from 'react';
import { FaSearch, FaStar, FaFilter, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Books.css';
import bookService from '../api/bookService';
import { BookLanguage, Status, Category, Genre, Format } from '../utils/enums';

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

    // Get current price considering discounts
    const getCurrentPrice = (book) => {
        if (!book.inventories || book.inventories.length === 0) return 'N/A';

        const inventory = book.inventories[0];
        if (inventory.isOnSale && inventory.discountPercent > 0) {
            const currentDate = new Date();
            const startDate = new Date(inventory.discoundStartDate);
            const endDate = new Date(inventory.discoundEndDate);

            if (currentDate >= startDate && currentDate <= endDate) {
                const discountedPrice = inventory.price * (1 - inventory.discountPercent / 100);
                return discountedPrice.toFixed(2);
            }
        }
        return inventory.price.toFixed(2);
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
                                    {Object.entries(Category).map(([key, value]) => (
                                        <li key={key}>
                                            <a className="dropdown-item" href="#">{value}</a>
                                        </li>
                                    ))}
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
                                    {Object.entries(Genre).map(([key, value]) => (
                                        <li key={key}>
                                            <a className="dropdown-item" href="#">{value}</a>
                                        </li>
                                    ))}
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
                                    {Object.entries(Format).map(([key, value]) => (
                                        <li key={key}>
                                            <a className="dropdown-item" href="#">{value}</a>
                                        </li>
                                    ))}
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
                                        src={book.image}
                                        alt={book.title}
                                        className="book-image"
                                    />
                                    {book.inventories?.[0]?.isOnSale && (
                                        <div className="sale-badge">
                                            Sale {book.inventories[0].discountPercent}% OFF
                                        </div>
                                    )}
                                </div>
                                <div className="card-body">
                                    <h5 className="card-title">{book.title}</h5>
                                    <p className="card-text text-muted mb-2">
                                        {book.publisher} • {new Date(book.publicationDate).getFullYear()} • {BookLanguage[book.language]}
                                    </p>
                                    {book.filters?.[0] && (
                                        <div className="book-categories mb-2">
                                            <span className="badge bg-secondary me-1">
                                                {Category[book.filters[0].category]}
                                            </span>
                                            <span className="badge bg-secondary me-1">
                                                {Genre[book.filters[0].genre]}
                                            </span>
                                            <span className="badge bg-secondary">
                                                {Format[book.filters[0].format]}
                                            </span>
                                        </div>
                                    )}
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <div className="price">
                                            ${getCurrentPrice(book)}
                                            {book.inventories?.[0]?.isOnSale && (
                                                <span className="original-price ms-2">
                                                    ${book.inventories[0].price.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="stock-status">
                                            <span className={book.status === 0 ? 'text-success' : 'text-danger'}>
                                                {Status[book.status]}
                                            </span>
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
