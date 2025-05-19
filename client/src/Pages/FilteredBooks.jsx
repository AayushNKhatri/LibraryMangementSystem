import React, { useState, useEffect } from 'react';
import { FaSearch, FaStar, FaFilter, FaChevronDown, FaChevronRight, FaTimes, FaBook, FaLanguage, FaCheck } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Books.css'; // Reusing Books.css
import filterService from '../api/FilterService';
import bookService from '../api/bookService';
import { BookLanguage, Status, Category, Genre, Format } from '../utils/enums';

const FilteredBooks = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [visibleBooks, setVisibleBooks] = useState(8);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filter state
    const [activeFilters, setActiveFilters] = useState({
        type: null,
        value: null,
        label: null
    });
    const [filterTitle, setFilterTitle] = useState('All Books');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        // Check URL parameters for filters
        const queryParams = new URLSearchParams(location.search);
        const filterType = queryParams.get('type');
        const filterValue = queryParams.get('value');
        const filterLabel = queryParams.get('label');
        
        if (filterType) {
            setActiveFilters({
                type: filterType,
                value: filterValue,
                label: filterLabel || filterType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
            });
        }
    }, [location]);

    useEffect(() => {
        fetchBooks();
    }, [activeFilters]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            let data;
            
            if (!activeFilters.type) {
                // Default to getting all books
                data = await bookService.getAllBooks();
                setFilterTitle('All Books');
            } else {
                console.log(`Fetching books with filter: ${activeFilters.type}, value: ${activeFilters.value}`);
                data = await filterService.getFilteredBooks(activeFilters.type, activeFilters.value);
                
                // If the data is in BookFilters format, we need to fetch the complete book details
                if (data && data.length > 0 && !data[0].title) {
                    // Fetch complete details for each filtered book
                    const completeBooks = await Promise.all(
                        data.map(async (book) => {
                            try {
                                const bookId = book.bookId || book.id;
                                if (!bookId) return null;
                                
                                const completeBookData = await bookService.getBookById(bookId);
                                return completeBookData;
                            } catch (error) {
                                console.error(`Error fetching details for book:`, error);
                                return null;
                            }
                        })
                    );
                    
                    data = completeBooks.filter(book => book !== null);
                }
                
                // Set filter title based on active filter
                setFilterTitle(activeFilters.label || 'Filtered Books');
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

    const applyFilter = (filterType, filterValue = null, label = null) => {
        // For direct genre filters, we use the type directly with no value
        const filterLabel = label || (filterValue ? 
            (filterType === 'category' ? Category[filterValue] :
             filterType === 'genre' ? Genre[filterValue] :
             filterType === 'format' ? Format[filterValue] :
             filterType === 'language' ? BookLanguage[filterValue] :
             filterType === 'status' ? Status[filterValue] : null) 
            : filterType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()));
            
        console.log(`Applying filter: ${filterType}, value: ${filterValue}, label: ${filterLabel}`);
        
        // Update URL with filter parameters
        const params = new URLSearchParams();
        if (filterType) {
            params.set('type', filterType);
            if (filterValue !== null) params.set('value', filterValue);
            if (filterLabel) params.set('label', filterLabel);
            navigate(`/filtered-books?${params.toString()}`);
        } else {
            navigate('/filtered-books');
        }
        
        setActiveFilters({ type: filterType, value: filterValue, label: filterLabel });
        setVisibleBooks(8); // Reset pagination when applying new filter
    };
    
    const clearFilters = () => {
        setActiveFilters({ type: null, value: null, label: null });
        setVisibleBooks(8);
        navigate('/filtered-books');
    };
    
    const toggleFilters = () => {
        setShowFilters(!showFilters);
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
                            <button 
                                className={`btn ${showFilters ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={toggleFilters}
                                type="button"
                            >
                                <FaFilter className="me-2" />
                                Filters {showFilters ? <FaChevronDown className="ms-1" /> : <FaChevronRight className="ms-1" />}
                            </button>
                        </div>
                    </div>
                </div>
                
                {activeFilters.type && (
                    <div className="row justify-content-center mt-2 mb-3">
                        <div className="col-md-8">
                            <div className="d-flex justify-content-center">
                                <div className="active-filter-badge">
                                    <span className="me-2">
                                        Active Filter: {activeFilters.label}
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
                
                {showFilters && (
                    <div className="row justify-content-center">
                        <div className="col-md-10">
                            <div className="filter-panels p-3 mb-4 border rounded">
                                <div className="row">
                                    {/* Category Filters */}
                                    <div className="col-md-4 mb-3">
                                        <h5 className="filter-heading"><FaBook className="me-2" /> Categories</h5>
                                        <div className="filter-options">
                                            {Object.entries(Category).map(([key, value]) => (
                                                <button 
                                                    key={key}
                                                    className={`btn btn-sm m-1 ${activeFilters.type === 'category' && activeFilters.value === key ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                    onClick={() => applyFilter('category', key, value)}
                                                >
                                                    {value}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Genre Filters */}
                                    <div className="col-md-4 mb-3">
                                        <h5 className="filter-heading">Genres</h5>
                                        <div className="filter-options">
                                            {Object.entries(Genre).map(([key, value]) => (
                                                <button 
                                                    key={key}
                                                    className={`btn btn-sm m-1 ${activeFilters.type === 'genre' && activeFilters.value === key ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                    onClick={() => applyFilter('genre', key, value)}
                                                >
                                                    {value}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Format Filters */}
                                    <div className="col-md-4 mb-3">
                                        <h5 className="filter-heading">Format</h5>
                                        <div className="filter-options">
                                            {Object.entries(Format).map(([key, value]) => (
                                                <button 
                                                    key={key}
                                                    className={`btn btn-sm m-1 ${activeFilters.type === 'format' && activeFilters.value === key ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                    onClick={() => applyFilter('format', key, value)}
                                                >
                                                    {value}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="row mt-2">
                                    {/* Language Filters */}
                                    <div className="col-md-4 mb-3">
                                        <h5 className="filter-heading"><FaLanguage className="me-2" /> Language</h5>
                                        <div className="filter-options">
                                            {Object.entries(BookLanguage).map(([key, value]) => (
                                                <button 
                                                    key={key}
                                                    className={`btn btn-sm m-1 ${activeFilters.type === 'language' && activeFilters.value === key ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                    onClick={() => applyFilter('language', key, value)}
                                                >
                                                    {value}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Status Filters */}
                                    <div className="col-md-4 mb-3">
                                        <h5 className="filter-heading"><FaCheck className="me-2" /> Availability</h5>
                                        <div className="filter-options">
                                            {Object.entries(Status).map(([key, value]) => (
                                                <button 
                                                    key={key}
                                                    className={`btn btn-sm m-1 ${activeFilters.type === 'status' && activeFilters.value === key ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                    onClick={() => applyFilter('status', key, value)}
                                                >
                                                    {value}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Special Collections */}
                                    <div className="col-md-4 mb-3">
                                        <h5 className="filter-heading">Special Collections</h5>
                                        <div className="filter-options">
                                            <button 
                                                className={`btn btn-sm m-1 ${activeFilters.type === 'new-arrivals' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                onClick={() => applyFilter('new-arrivals', null, 'New Arrivals')}
                                            >
                                                New Arrivals
                                            </button>
                                            <button 
                                                className={`btn btn-sm m-1 ${activeFilters.type === 'collectors' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                onClick={() => applyFilter('collectors', null, 'Collectors Edition')}
                                            >
                                                Collectors Edition
                                            </button>
                                            <button 
                                                className={`btn btn-sm m-1 ${activeFilters.type === 'paperbacks' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                onClick={() => applyFilter('paperbacks', null, 'Paperbacks')}
                                            >
                                                Paperbacks
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-center mt-3">
                                    <button className="btn btn-secondary" onClick={clearFilters}>
                                        Clear All Filters
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