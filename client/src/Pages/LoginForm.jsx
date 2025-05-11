import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LoginForm.css';

const LoginForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically handle login logic
        console.log('Login attempt:', formData);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <div className="input-group">
                            <span className="input-group-text">
                                <FaUser />
                            </span>
                            <input
                                type="text"
                                name="username"
                                className="form-control"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-group">
                            <span className="input-group-text">
                                <FaLock />
                            </span>
                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-options">
                        <div className="form-check">
                            <input type="checkbox" className="form-check-input" id="remember" />
                            <label className="form-check-label" htmlFor="remember">Remember me</label>
                        </div>
                        <a href="#" className="forgot-password">Forgot Password?</a>
                    </div>

                    <button type="submit" className="btn btn-primary login-button">
                        <FaSignInAlt className="me-2" />
                        Sign In
                    </button>

                    <div className="register-link">
                        Don't have an account?{' '}
                        <span onClick={() => navigate('/register')}>Register here</span>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginForm;