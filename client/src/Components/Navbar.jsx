import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaBullhorn, FaSignOutAlt, FaUserCircle, FaBook } from 'react-icons/fa';
import { isAdmin, getCurrentUser, logout } from '../utils/tokenUtils';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './Navbar.css';

const Navbar = () => {
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
                        <span className="d-none d-md-inline">{user?.username || 'Profile'}</span>
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
            <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                    Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm rounded-pill px-3">
                    Register
                </Link>
            </div>
        );
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light shadow-sm sticky-top bg-white py-3">
            <div className="container">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <FaBook className="me-2 text-primary" size={24} />
                    <h1 className="brand-text m-0">Kitaab Mitra</h1>
                </Link>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav mx-auto">
                        <li className="nav-item mx-2">
                            <Link className="nav-link fw-medium" to="/books">
                                Shop
                            </Link>
                        </li>

                        <li className="nav-item mx-2">
                            <Link className="nav-link fw-medium" to="/about">
                                About Us
                            </Link>
                        </li>

                        <li className="nav-item mx-2">
                            <Link className="nav-link fw-medium" to="/contact">
                                Contact Us
                            </Link>
                        </li>

                        <li className="nav-item mx-2">
                            <Link className="nav-link fw-medium" to="/announcements">
                                <FaBullhorn className="nav-icon-small me-1" /> Announcements
                            </Link>
                        </li>
                    </ul>

                    <div className="d-flex align-items-center gap-3">
                        {isAuthenticated && (
                            <Link to="/cart" className="nav-icon-link me-2 position-relative">
                                <FaShoppingCart className="nav-icon fs-5" />
                            </Link>
                        )}
                        <AuthButtons />
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
