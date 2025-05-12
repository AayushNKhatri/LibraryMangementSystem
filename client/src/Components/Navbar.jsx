import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaUser, FaShoppingCart, FaBullhorn } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './Navbar.css';

const Navbar = () => {
    const [showSearch, setShowSearch] = useState(false);

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container">
                <div className="navbar-brand-container">
                    <Link className="navbar-brand" to="/">
                        <h1 className="brand-text">Kitaab Mitra</h1>
                    </Link>
                </div>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                Shop
                            </a>
                            <ul className="dropdown-menu">
                                <li><Link className="dropdown-item" to="/new-arrivals">New Arrivals</Link></li>
                                <li><Link className="dropdown-item" to="/bestsellers">Bestsellers</Link></li>
                                <li><Link className="dropdown-item" to="/textbooks">Textbooks</Link></li>
                            </ul>
                        </li>

                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                Collections
                            </a>
                            <ul className="dropdown-menu">
                                <li><Link className="dropdown-item" to="/fiction">Fiction</Link></li>
                                <li><Link className="dropdown-item" to="/non-fiction">Non-Fiction</Link></li>
                                <li><Link className="dropdown-item" to="/academic">Academic</Link></li>
                            </ul>
                        </li>

                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                Explore
                            </a>
                            <ul className="dropdown-menu">
                                <li><Link className="dropdown-item" to="/authors">Authors</Link></li>
                                <li><Link className="dropdown-item" to="/publishers">Publishers</Link></li>
                                <li><Link className="dropdown-item" to="/events">Events</Link></li>
                            </ul>
                        </li>
                        
                        <li className="nav-item">
                            <Link className="nav-link" to="/announcements">
                                <FaBullhorn className="nav-icon-small me-1" /> Announcements
                            </Link>
                        </li>
                    </ul>

                    <div className="d-flex align-items-center gap-4">
                        <div className="search-container">
                            <FaSearch 
                                className="search-icon" 
                                onClick={() => setShowSearch(!showSearch)}
                            />
                            {showSearch && (
                                <div className="search-overlay">
                                    <div className="search-content">
                                        <input 
                                            type="search" 
                                            className="form-control search-input" 
                                            placeholder="Search By Author, ISBN"
                                            autoFocus
                                        />
                                        <button className="close-search" onClick={() => setShowSearch(false)}>×</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="d-flex gap-4">
                            <Link to="/account" className="nav-icon-link">
                                <FaUser className="nav-icon" />
                            </Link>
                            <Link to="/cart" className="nav-icon-link">
                                <FaShoppingCart className="nav-icon" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;