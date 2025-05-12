import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaUsers, FaExchangeAlt, FaSearch, FaArrowRight } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';
import AnnouncementWidget from './Components/AnnouncementWidget';

function Home() {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div className="home-container">
            {/* Hero Section */}
            <header className="hero-section">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <h1 className="display-4 fw-bold mb-4">Discover Your Next Great Read</h1>
                            <p className="lead mb-4">Explore our vast collection of books, manage your reading journey, and connect with fellow book lovers.</p>
                            <button 
                                className="btn btn-primary btn-lg"
                                onClick={() => handleNavigation('/books')}
                            >
                                Browse Books <FaArrowRight className="ms-2" />
                            </button>
                        </div>
                        <div className="col-lg-6">
                            <img 
                                src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&auto=format&fit=crop&q=60" 
                                alt="Library" 
                                className="img-fluid rounded-3 shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </header>
            
            {/* Announcements Widget */}
            <div className="container">
                <AnnouncementWidget />
            </div>

            {/* Features Section */}
            <section className="features-section py-5">
                <div className="container">
                    <h2 className="text-center mb-5">Our Features</h2>
                    <div className="row g-4">
                        <div className="col-md-6 col-lg-3">
                            <div 
                                className="feature-card"
                                onClick={() => handleNavigation('/books')}
                            >
                                <div className="icon-wrapper">
                                    <FaBook className="feature-icon" />
                                </div>
                                <h3>Book Collection</h3>
                                <p>Browse through our extensive collection of books with detailed information and reviews.</p>
                                <div className="feature-overlay">
                                    <button className="btn btn-light">
                                        Learn More <FaArrowRight className="ms-2" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <div 
                                className="feature-card"
                                onClick={() => handleNavigation('/members')}
                            >
                                <div className="icon-wrapper">
                                    <FaUsers className="feature-icon" />
                                </div>
                                <h3>Member Portal</h3>
                                <p>Manage your profile, track your reading history, and maintain your wishlist.</p>
                                <div className="feature-overlay">
                                    <button className="btn btn-light">
                                        Learn More <FaArrowRight className="ms-2" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <div 
                                className="feature-card"
                                onClick={() => handleNavigation('/borrow')}
                            >
                                <div className="icon-wrapper">
                                    <FaExchangeAlt className="feature-icon" />
                                </div>
                                <h3>Borrowing System</h3>
                                <p>Easy book borrowing and return process with automatic due date tracking.</p>
                                <div className="feature-overlay">
                                    <button className="btn btn-light">
                                        Learn More <FaArrowRight className="ms-2" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <div 
                                className="feature-card"
                                onClick={() => handleNavigation('/search')}
                            >
                                <div className="icon-wrapper">
                                    <FaSearch className="feature-icon" />
                                </div>
                                <h3>Smart Search</h3>
                                <p>Find your next read with our advanced search and filtering system.</p>
                                <div className="feature-overlay">
                                    <button className="btn btn-light">
                                        Learn More <FaArrowRight className="ms-2" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section py-5 bg-light">
                <div className="container">
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="stat-card text-center">
                                <h3 className="stat-number">10,000+</h3>
                                <p className="stat-label">Books Available</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="stat-card text-center">
                                <h3 className="stat-number">5,000+</h3>
                                <p className="stat-label">Active Members</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="stat-card text-center">
                                <h3 className="stat-number">1,000+</h3>
                                <p className="stat-label">Daily Visitors</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section py-5">
                <div className="container text-center">
                    <h2 className="mb-4">Ready to Start Your Reading Journey?</h2>
                    <div className="d-flex justify-content-center gap-3">
                        <button 
                            className="btn btn-primary btn-lg"
                            onClick={() => handleNavigation('/register')}
                        >
                            Join Now
                        </button>
                        <button 
                            className="btn btn-outline-primary btn-lg"
                            onClick={() => handleNavigation('/login')}
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;