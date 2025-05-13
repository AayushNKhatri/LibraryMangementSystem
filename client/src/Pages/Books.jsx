import React, { useState, useEffect } from 'react';
import { FaSearch, FaStar, FaFilter, FaChevronDown, FaChevronRight, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Books.css';
import bookService from '../api/bookService';
import filterService from '../api/FilterService';
import { BookLanguage, Status, Category, Genre, Format } from '../utils/enums';

const BookPage = () => {
    const navigate = useNavigate();
    const [visibleBooks, setVisibleBooks] = useState(4);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState({
        type: null,
        value: null,
        label: null
    });

    useEffect(() => {
        fetchBooks();
    }, [activeFilters]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            let data;
            
            if (activeFilters.type) {
                console.log(`Fetching books with filter: ${activeFilters.type}, value: ${activeFilters.value}`);
                const filteredResults = await filterService.getFilteredBooks(activeFilters.type, activeFilters.value);
                console.log(`Found ${filteredResults.length} filtered books:`, filteredResults);
                
                // Fetch complete details for each filtered book
                if (filteredResults && filteredResults.length > 0) {
                    // The filtered results might only contain IDs or partial data
                    // Fetch complete book data for each book in the filtered results
                    const completeBooks = await Promise.all(
                        filteredResults.map(async (book) => {
                            try {
                                // If the book already has complete data, use it
                                if (book && book.title && book.description && book.price) {
                                    return book;
                                }
                                
                                // Otherwise fetch complete book data
                                const bookId = book.id || book.bookId;
                                if (!bookId) {
                                    console.warn('Book without ID in filtered results:', book);
                                    return book;
                                }
                                
                                console.log(`Fetching complete details for book ID: ${bookId}`);
                                const completeBookData = await bookService.getBookById(bookId);
                                
                                // The API might return an array or a single object
                                let bookData;
                                if (Array.isArray(completeBookData)) {
                                    bookData = completeBookData.find(b => 
                                        b.bookId.toString() === bookId.toString() || 
                                        (b.id && b.id.toString() === bookId.toString())
                                    );
                                } else {
                                    bookData = completeBookData;
                                }
                                
                                console.log(`Fetched complete details for book: ${bookData?.title || 'unknown'}`);
                                return bookData || book;
                            } catch (error) {
                                console.error(`Error fetching details for book:`, error);
                                return book;
                            }
                        })
                    );
                    
                    data = completeBooks.filter(book => book !== null && book !== undefined);
                    console.log(`Processed ${data.length} books with complete details`);
                } else {
                    data = [];
                }
            } else {
                data = await bookService.getAllBooks();
            }
            
            if (data) {
                console.log(`Found ${data.length} books:`, data);
                // Ensure data has expected structure
                const validBooks = data.map(book => {
                    // If book doesn't have an image property, set a default
                    if (!book.image) {
                        book.image = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
                    }
                    
                    // Ensure required properties exist
                    return {
                        ...book,
                        title: book.title || 'Untitled Book',
                        description: book.description || 'No description available',
                        publisher: book.publisher || 'Unknown Publisher',
                        price: book.price || (book.inventories?.[0]?.price || 'N/A'),
                        language: book.language !== undefined ? book.language : 'Unknown'
                    };
                });
                setBooks(validBooks);
            } else {
                console.log('No books returned from API');
                setBooks([]);
            }
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
        console.log('Navigating to book detail page with ID:', bookId);
        
        if (!bookId) {
            console.error('Invalid bookId:', bookId);
            return;
        }
        
        navigate(`/book/${bookId}`);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const applyFilter = (filterType, filterValue = null, label = null) => {
        // For direct genre filters, we use the type directly with no value
        const filterLabel = label || (filterValue ? 
            (filterType === 'category' ? Category[filterValue] :
             filterType === 'genre' ? Genre[filterValue] :
             filterType === 'format' ? Format[filterValue] : null) 
            : filterType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()));
            
        console.log(`Applying filter: ${filterType}, value: ${filterValue}, label: ${filterLabel}`);
        setActiveFilters({ type: filterType, value: filterValue, label: filterLabel });
        setVisibleBooks(4); // Reset pagination when applying new filter
    };

    const clearFilters = () => {
        setActiveFilters({ type: null, value: null, label: null });
        setVisibleBooks(4);
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
        !searchTerm || (book.title && book.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    console.log(`After search filter, ${filteredBooks.length} books remain from ${books.length} total books`);

    // Display loading message
    if (loading) {
        return (
            <div className="container py-5 text-center">
                <h2>Loading books...</h2>
                <div className="spinner-border mt-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
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
                        <div className="d-flex justify-content-center gap-3 filters-wrapper flex-wrap">
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
                                            <button 
                                                className="dropdown-item" 
                                                onClick={() => applyFilter('category', key, value)}
                                            >
                                                {value}
                                            </button>
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
                                            <button 
                                                className="dropdown-item" 
                                                onClick={() => applyFilter('genre', key, value)}
                                            >
                                                {value}
                                            </button>
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
                                            <button 
                                                className="dropdown-item" 
                                                onClick={() => applyFilter('format', key, value)}
                                            >
                                                {value}
                                            </button>
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
                                    Special Collections
                                </button>
                                <ul className="dropdown-menu">
                                    <li>
                                        <button 
                                            className="dropdown-item" 
                                            onClick={() => applyFilter('new-arrivals', null, 'New Arrivals')}
                                        >
                                            New Arrivals
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            className="dropdown-item" 
                                            onClick={() => applyFilter('collectors', null, 'Collectors Edition')}
                                        >
                                            Collectors Edition
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            className="dropdown-item" 
                                            onClick={() => applyFilter('paperbacks', null, 'Paperbacks')}
                                        >
                                            Paperbacks
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            <div className="dropdown">
                                <button
                                    className="btn btn-outline-secondary dropdown-toggle"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                >
                                    <FaFilter className="me-2" />
                                    Popular Genres
                                </button>
                                <ul className="dropdown-menu">
                                    <li>
                                        <button 
                                            className="dropdown-item" 
                                            onClick={() => applyFilter('fantasy', null, 'Fantasy')}
                                        >
                                            Fantasy
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            className="dropdown-item" 
                                            onClick={() => applyFilter('adventure', null, 'Adventure')}
                                        >
                                            Adventure
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            className="dropdown-item" 
                                            onClick={() => applyFilter('science', null, 'Science')}
                                        >
                                            Science
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            className="dropdown-item" 
                                            onClick={() => applyFilter('fiction', null, 'Fiction')}
                                        >
                                            Fiction
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            className="dropdown-item" 
                                            onClick={() => applyFilter('non-fiction', null, 'Non-Fiction')}
                                        >
                                            Non-Fiction
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {activeFilters.type && (
                    <div className="row justify-content-center mt-3">
                        <div className="col-md-8">
                            <div className="d-flex justify-content-center">
                                <div className="active-filter-badge">
                                    <span className="me-2">
                                        {activeFilters.label}
                                    </span>
                                    <button 
                                        className="btn btn-sm text-danger" 
                                        onClick={clearFilters}
                                        aria-label="Clear filter"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {filteredBooks.length === 0 ? (
                <div className="text-center py-5">
                    <h3>No books found matching your criteria.</h3>
                    {activeFilters.type && (
                        <div>
                            <p className="text-muted mt-3">Try another filter or clear the current filter.</p>
                            <button className="btn btn-outline-secondary mt-2" onClick={clearFilters}>
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="row g-4">
                        {filteredBooks.slice(0, visibleBooks).map((book, index) => {
                            // Ensure we have a valid ID
                            const bookId = book.id || book.bookId;
                            
                            // Debug the book object
                            console.log(`Rendering book:`, book);
                            
                            // Get author information
                            const author = book.authorNamePrimary || book.author || 'Unknown Author';
                            
                            return (
                                <div key={bookId || index} className="col-md-3 mb-4">
                                    <div
                                        className="card h-100 book-card"
                                        onClick={() => bookId && handleBookClick(bookId)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="book-image-container">
                                            <img
                                                src={book.image || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"}
                                                alt={book.title || 'Book cover'}
                                                className="book-image"
                                                onError={(e) => {
                                                    e.target.onerror = null; 
                                                    e.target.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
                                                }}
                                            />
                                            {book.inventories?.[0]?.isOnSale && book.inventories?.[0]?.discountPercent > 0 && (
                                                <div className="sale-badge">
                                                    Sale {book.inventories[0].discountPercent}% OFF
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-body">
                                            <h5 className="card-title">{book.title || 'Untitled Book'}</h5>
                                            <p className="card-text text-muted mb-2">
                                                <small>{author}</small>
                                            </p>
                                            <p className="card-text text-muted mb-2">
                                                {book.publisher || 'Unknown Publisher'} • {book.publicationDate ? new Date(book.publicationDate).getFullYear() : 'N/A'} • {book.language !== undefined ? BookLanguage[book.language] : 'Unknown Language'}
                                            </p>
                                            {book.filters?.[0] && (
                                                <div className="book-categories mb-2">
                                                    <span className="badge bg-secondary me-1">
                                                        {Category[book.filters[0].category] || 'N/A'}
                                                    </span>
                                                    <span className="badge bg-secondary me-1">
                                                        {Genre[book.filters[0].genre] || 'N/A'}
                                                    </span>
                                                    <span className="badge bg-secondary">
                                                        {Format[book.filters[0].format] || 'N/A'}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <div className="price">
                                                    ${book.price || 'N/A'}
                                                    {book.inventories?.[0]?.isOnSale && book.inventories?.[0]?.discountPercent > 0 && (
                                                        <span className="original-price ms-2">
                                                            ${book.inventories[0].price.toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="stock-status">
                                                    <span className={book.status === 0 ? 'text-success' : 'text-danger'}>
                                                        {book.status !== undefined ? Status[book.status] : 'Unknown Status'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

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
                </>
            )}
        </div>
    );
}

export default BookPage;
