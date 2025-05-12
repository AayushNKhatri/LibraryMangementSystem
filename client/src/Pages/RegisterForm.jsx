import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaUserPlus } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './RegisterForm.css';
import registerService from '../api/Register';

const RegisterForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [register, conformRegister] = useState([]);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        contact: '',
        street: '',
        city: '',
        password: '',
        confirmPassword: ''
    });
    useEffect(()=>{
        handleSubmit();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const handleSubmit = async (e) => 
        {
            e.preventDefault();
            try
            {
                setLoading(true);
                const data = await registerService.registerUser(formData);
                conformRegister(data);
                setLoading(false);
            }
            catch(error)
            {
                console.error("User not registered", error);
                setError("Failed to register. Register user");
                setLoading(false);
            }
        }


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
                                <label className="form-label">City</label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <FaEnvelope />
                                    </span>
                                    <input
                                        type="text"
                                        name="city"
                                        className="form-control"
                                        placeholder="Enter your city"
                                        value={formData.city}
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
                                <label className="form-label">Street</label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <FaEnvelope />
                                    </span>
                                    <input
                                        type="text"
                                        name="street"
                                        className="form-control"
                                        placeholder="Enter your street"
                                        value={formData.street}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">username</label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <FaEnvelope />
                                    </span>
                                    <input
                                        type="text"
                                        name="username"
                                        className="form-control"
                                        placeholder="Enter your username"
                                        value={formData.username}
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
                                        name="contact"
                                        className="form-control"
                                        placeholder="Enter phone number"
                                        value={formData.contact}
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