import React, { useState, useEffect } from 'react';
import { FaSearch, FaStar, FaFilter, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Books.css'; // Reusing Books.css
import filterService from '../api/FilterService';
import bookService from '../api/bookService';
import { BookLanguage, Status, Category, Genre, Format } from '../utils/enums';

const FilteredBooks = () => {
    const navigate = useNavigate();
    const [visibleBooks, setVisibleBooks] = useState(8);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [filterTitle, setFilterTitle] = useState('All Books');

    useEffect(() => {
        // Check if there's an active filter in localStorage
        const storedFilter = localStorage.getItem('activeFilter');
        if (storedFilter) {
            setActiveFilter(storedFilter);
            // Clear it after reading to avoid stale data on page refresh
            localStorage.removeItem('activeFilter');
        }
    }, []);

    useEffect(() => {
        fetchBooks();
    }, [activeFilter]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            let data;

            // Select the appropriate endpoint based on the active filter
            switch(activeFilter) {
                case 'new-arrivals':
                    data = await filterService.getFilteredNewArrivals();
                    setFilterTitle('New Arrivals');
                    break;
                case 'collectors':
                    data = await filterService.getFilteredCollectors();
                    setFilterTitle('Collector\'s Editions');
                    break;
                case 'paperbacks':
                    data = await filterService.getFilteredPapaerbacks();
                    setFilterTitle('Paperbacks');
                    break;
                case 'fantasy':
                    data = await filterService.getFilteredFantasy();
                    setFilterTitle('Fantasy Books');
                    break;
                case 'adventure':
                    data = await filterService.getFilteredAdventure();
                    setFilterTitle('Adventure Books');
                    break;
                case 'science':
                    data = await filterService.getFilteredScience();
                    setFilterTitle('Science Books');
                    break;
                case 'fiction':
                    data = await filterService.getFilteredFiction();
                    setFilterTitle('Fiction Books');
                    break;
                case 'non-fiction':
                    data = await filterService.getFilteredNonFiction();
                    setFilterTitle('Non-Fiction Books');
                    break;
                default:
                    // Default to getting all books
                    data = await bookService.getAllBooks();
                    setFilterTitle('All Books');
                    break;
            }

            setBooks(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching books:', error);
            setError('Failed to load books. Please try again later.');
            setLoading(false);
        }
    };

    const handleViewMore = () => {
        setVisibleBooks(prev => prev + 8);
    };

    const handleBookClick = (bookId) => {
        navigate(`/book/${bookId}`);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        setVisibleBooks(8); // Reset visible books count when changing filter
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
            <h1 className="text-center mb-5">{filterTitle}</h1>

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
                    <div className="col-md-10">
                        <div className="d-flex justify-content-center gap-3 filters-wrapper flex-wrap">
                            <div className="dropdown">
                                <button
                                    className={`btn ${activeFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'} dropdown-toggle`}
                                    type="button"
                                    data-bs-toggle="dropdown"
                                >
                                    <FaFilter className="me-2" />
                                    Format
                                </button>
                                <ul className="dropdown-menu">
                                    <li>
                                        <a 
                                            className={`dropdown-item ${activeFilter === 'all' ? 'active' : ''}`} 
                                            href="#" 
                                            onClick={() => handleFilterChange('all')}
                                        >
                                            All Books
                                        </a>
                                    </li>
                                    <li>
                                        <a 
                                            className={`dropdown-item ${activeFilter === 'paperbacks' ? 'active' : ''}`} 
                                            href="#" 
                                            onClick={() => handleFilterChange('paperbacks')}
                                        >
                                            Paperbacks
                                        </a>
                                    </li>
                                    <li>
                                        <a 
                                            className={`dropdown-item ${activeFilter === 'collectors' ? 'active' : ''}`} 
                                            href="#" 
                                            onClick={() => handleFilterChange('collectors')}
                                        >
                                            Collector's Editions
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div className="dropdown">
                                <button
                                    className={`btn ${['fantasy', 'adventure', 'science', 'fiction', 'non-fiction'].includes(activeFilter) ? 'btn-primary' : 'btn-outline-secondary'} dropdown-toggle`}
                                    type="button"
                                    data-bs-toggle="dropdown"
                                >
                                    <FaFilter className="me-2" />
                                    Genres
                                </button>
                                <ul className="dropdown-menu">
                                    <li>
                                        <a 
                                            className={`dropdown-item ${activeFilter === 'fantasy' ? 'active' : ''}`} 
                                            href="#" 
                                            onClick={() => handleFilterChange('fantasy')}
                                        >
                                            Fantasy
                                        </a>
                                    </li>
                                    <li>
                                        <a 
                                            className={`dropdown-item ${activeFilter === 'adventure' ? 'active' : ''}`} 
                                            href="#" 
                                            onClick={() => handleFilterChange('adventure')}
                                        >
                                            Adventure
                                        </a>
                                    </li>
                                    <li>
                                        <a 
                                            className={`dropdown-item ${activeFilter === 'science' ? 'active' : ''}`} 
                                            href="#" 
                                            onClick={() => handleFilterChange('science')}
                                        >
                                            Science
                                        </a>
                                    </li>
                                    <li>
                                        <a 
                                            className={`dropdown-item ${activeFilter === 'fiction' ? 'active' : ''}`} 
                                            href="#" 
                                            onClick={() => handleFilterChange('fiction')}
                                        >
                                            Fiction
                                        </a>
                                    </li>
                                    <li>
                                        <a 
                                            className={`dropdown-item ${activeFilter === 'non-fiction' ? 'active' : ''}`} 
                                            href="#" 
                                            onClick={() => handleFilterChange('non-fiction')}
                                        >
                                            Non-Fiction
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div className="dropdown">
                                <button
                                    className={`btn ${activeFilter === 'new-arrivals' ? 'btn-primary' : 'btn-outline-secondary'} dropdown-toggle`}
                                    type="button"
                                    data-bs-toggle="dropdown"
                                >
                                    <FaFilter className="me-2" />
                                    New Releases
                                </button>
                                <ul className="dropdown-menu">
                                    <li>
                                        <a 
                                            className={`dropdown-item ${activeFilter === 'new-arrivals' ? 'active' : ''}`} 
                                            href="#" 
                                            onClick={() => handleFilterChange('new-arrivals')}
                                        >
                                            New Arrivals
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {filteredBooks.length === 0 ? (
                <div className="text-center py-5">
                    <h3>No books found matching your criteria.</h3>
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
                                        src={book.image || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"}
                                        alt={book.title}
                                        className="book-image"
                                        onError={(e) => {
                                            e.target.onerror = null; 
                                            e.target.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
                                        }}
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
                                        {book.author || book.publisher} • {book.publicationDate ? new Date(book.publicationDate).getFullYear() : 'N/A'} • {BookLanguage[book.language] || 'English'}
                                    </p>
                                    {book.filters?.[0] && (
                                        <div className="book-categories mb-2">
                                            <span className="badge bg-secondary me-1">
                                                {Category[book.filters[0].category] || 'General'}
                                            </span>
                                            <span className="badge bg-secondary me-1">
                                                {Genre[book.filters[0].genre] || 'Mixed'}
                                            </span>
                                            <span className="badge bg-secondary">
                                                {Format[book.filters[0].format] || 'Standard'}
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
                                                {Status[book.status] || 'In Stock'}
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

export default FilteredBooks; 