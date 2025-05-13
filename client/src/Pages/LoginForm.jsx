import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import axios from 'axios';
import { parseApiError, logError } from '../utils/errorHandler';
import { setAuthToken, isAdmin, isAuthenticated } from '../utils/tokenUtils';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LoginForm.css';

const API_URL = 'http://localhost:5129/api';

const LoginForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        Email: '',
        Password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated()) {
            if (isAdmin()) {
                navigate('/admin');
            } else {
                navigate('/');
            }
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted', formData);

        if (!formData.Email || !formData.Password) {
            setError('Please enter both email and password');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            console.log('Making direct API call to:', `${API_URL}/User/Login`);

            const response = await axios.post(`${API_URL}/User/Login`, formData);
            console.log('Login response:', response.data);

            // The response contains just the token string
            if (response.data) {
                // Get token from response - might be directly the token string or in a token property
                const token = typeof response.data === 'string'
                    ? response.data
                    : response.data.token || '';

                if (!token) {
                    throw new Error('No token received from server');
                }

                // Store the token
                setAuthToken(token);

                // Get the return URL from location state or default paths
                const returnUrl = location.state?.from || '/';

                // Redirect based on role
                if (isAdmin()) {
                    // Always redirect admin to admin dashboard
                    navigate('/admin');
                } else {
                    // For regular users, redirect to the return URL or home
                    navigate(returnUrl);
                }
            }
        } catch (err) {
            // Use our error handler to get a clean message
            logError(err, 'Login');
            setError(parseApiError(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'email') {
            setFormData(prevState => ({
                ...prevState,
                Email: value
            }));
        } else if (name === 'password') {
            setFormData(prevState => ({
                ...prevState,
                Password: value
            }));
        } else {
            const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
            setFormData(prevState => ({
                ...prevState,
                [formattedName]: value
            }));
        }
    };

    const handleLoginClick = () => {
        document.getElementById('loginForm').dispatchEvent(
            new Event('submit', { cancelable: true, bubbles: true })
        );
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to your account</p>
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <form id="loginForm" onSubmit={handleSubmit} className="login-form">
                    <div className="form-group mb-3">
                        <div className="input-group">
                            <span className="input-group-text">
                                <FaUser />
                            </span>
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                placeholder="Email Address"
                                value={formData.Email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group mb-3">
                        <div className="input-group">
                            <span className="input-group-text">
                                <FaLock />
                            </span>
                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="Password"
                                value={formData.Password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-options mb-3">
                        <div className="form-check">
                            <input type="checkbox" className="form-check-input" id="remember" />
                            <label className="form-check-label" htmlFor="remember">Remember me</label>
                        </div>
                        <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
                    </div>

                    <button
                        type="button"
                        className="btn btn-primary login-button w-100"
                        disabled={isLoading}
                        onClick={handleLoginClick}
                    >
                        {isLoading ? (
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        ) : (
                            <FaSignInAlt className="me-2" />
                        )}
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>

                    <div className="register-link mt-3 text-center">
                        Don't have an account?{' '}
                        <Link to="/register">Register here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginForm;
