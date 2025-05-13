import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaBullhorn, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { isAdmin, getCurrentUser, logout } from '../utils/tokenUtils';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './Navbar.css';

const Navbar = () => {
    const [showSearch, setShowSearch] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userIsAdmin, setUserIsAdmin] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Function to update auth state
    const updateAuthState = () => {
        const userData = getCurrentUser();
        setIsAuthenticated(!!userData);
        setUserIsAdmin(isAdmin());
        setUser(userData);
    };

    // Check auth state when component mounts, location changes, or at regular intervals
    useEffect(() => {
        updateAuthState();
    }, [location.pathname]); // Only update on route changes

    // Also listen for localStorage changes (for cross-tab login/logout)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'authToken') {
                updateAuthState();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);
    const handleLogout = () => {
        logout();
        updateAuthState(); // Update immediately
        navigate('/login');
    };

    const AuthButtons = () => {
        if (isAuthenticated) {
            return (
                <div className="dropdown">
                    <a className="nav-link dropdown-toggle d-flex align-items-center gap-2"
                       href="#"
                       role="button"
                       data-bs-toggle="dropdown">
                        <FaUserCircle className="nav-icon" />
                        <span>{user?.username || 'Profile'}</span>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end">
                        {userIsAdmin && (
                            <li>
                                <Link className="dropdown-item" to="/admin">
                                    Admin Dashboard
                                </Link>
                            </li>
                        )}
                        <li>
                            <Link className="dropdown-item" to="/profile">
                                My Profile
                            </Link>
                        </li>
                        <li>
                            <Link className="dropdown-item" to="/orders">
                                My Orders
                            </Link>
                        </li>
                        <li>
                            <Link className="dropdown-item" to="/wishlist">
                                My Wishlist
                            </Link>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                            <button className="dropdown-item text-danger" onClick={handleLogout}>
                                <FaSignOutAlt className="me-2" />
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            );
        }
        return (
            <div className="d-flex gap-3">
                <Link to="/login" className="btn btn-outline-primary btn-sm">
                    Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                    Register
                </Link>
            </div>
        );
    };

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
                            <a className="nav-link dropdown-toggle" href="/books" role="button" data-bs-toggle="dropdown">
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

                        <div className="d-flex align-items-center gap-3">
                            {isAuthenticated && (
                                <Link to="/cart" className="nav-icon-link position-relative">
                                    <FaShoppingCart className="nav-icon" />
                                    <span className="cart-badge">0</span>
                                </Link>
                            )}
                            <AuthButtons />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
