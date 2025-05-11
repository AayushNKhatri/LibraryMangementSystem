import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaUserPlus } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './RegisterForm.css';

const RegisterForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically handle registration logic
        console.log('Registration attempt:', formData);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <h1>Create Account</h1>
                    <p>Join our library community</p>
                </div>

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="row g-3">
                        {/* First Column */}
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <FaUser />
                                    </span>
                                    <input
                                        type="text"
                                        name="firstName"
                                        className="form-control"
                                        placeholder="Enter first name"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <FaEnvelope />
                                    </span>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        placeholder="Enter email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <FaLock />
                                    </span>
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control"
                                        placeholder="Enter password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Second Column */}
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <FaUser />
                                    </span>
                                    <input
                                        type="text"
                                        name="lastName"
                                        className="form-control"
                                        placeholder="Enter last name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <FaPhone />
                                    </span>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-control"
                                        placeholder="Enter phone number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Confirm Password</label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <FaLock />
                                    </span>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className="form-control"
                                        placeholder="Confirm password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-check mt-3">
                        <input type="checkbox" className="form-check-input" id="terms" required />
                        <label className="form-check-label" htmlFor="terms">
                            I agree to the Terms and Conditions
                        </label>
                    </div>

                    <button type="submit" className="btn btn-primary register-button mt-4">
                        <FaUserPlus className="me-2" />
                        Create Account
                    </button>

                    <div className="login-link">
                        Already have an account?{' '}
                        <span onClick={() => navigate('/login')}>Sign in here</span>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RegisterForm;