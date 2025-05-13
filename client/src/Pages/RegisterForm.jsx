import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaUserPlus, FaExclamationTriangle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Alert, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './RegisterForm.css';
import userService from '../api/userService';

const RegisterForm = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [formData, setFormData] = useState({
        userName: '',
        firstName: '',
        lastName: '',
        email: '',
        contact: '',
        street: '',
        city: '',
        password: '',
        confirmPassword: ''
    });

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Toggle confirm password visibility
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    // Form validation
    const validateForm = () => {
        const newErrors = {};
        
        // Check required fields
        if (!formData.userName.trim()) newErrors.userName = "Username is required";
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        if (!formData.password) newErrors.password = "Password is required";
        if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }
        
        // Password validation
        if (formData.password && formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        
        // Password confirmation
        if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }
        
        // Phone validation
        if (formData.contact && !/^\d{10,12}$/.test(formData.contact.replace(/[^0-9]/g, ''))) {
            newErrors.contact = "Please enter a valid phone number";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Clear errors when user types
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        setGeneralError('');
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        try {
            setIsSubmitting(true);
            
            // Map form data to the expected DTO format
            const registrationData = {
                UserName: formData.userName,
                FirstName: formData.firstName,
                LastName: formData.lastName,
                Email: formData.email,
                Contact: formData.contact,
                Street: formData.street,
                City: formData.city,
                Password: formData.password
            };
            
            await userService.registerUser(registrationData);
            
            // Registration successful
            setRegistrationSuccess(true);
            
            // Redirect to login page after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (error) {
            console.error("Registration failed:", error);
            
            // Handle different error responses
            if (error.response) {
                // Server returned an error response
                const responseData = error.response.data;
                
                if (typeof responseData === 'string') {
                    // Handle string error messages
                    if (responseData.includes('User already exists')) {
                        setGeneralError('A user with this email or username already exists.');
                    } else if (responseData.includes('Registration failed')) {
                        setGeneralError(responseData);
                    } else {
                        setGeneralError('Registration failed. Please try again.');
                    }
                } else if (responseData.errors) {
                    // Handle validation errors
                    const serverErrors = {};
                    Object.keys(responseData.errors).forEach(key => {
                        const fieldName = key.charAt(0).toLowerCase() + key.slice(1);
                        serverErrors[fieldName] = responseData.errors[key][0];
                    });
                    setErrors(serverErrors);
                } else {
                    setGeneralError('Registration failed. Please check your information and try again.');
                }
            } else {
                // Network error or other issue
                setGeneralError('Registration failed. Please check your connection and try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <h1>Create Account</h1>
                    <p>Join our library community</p>
                </div>

                {registrationSuccess ? (
                    <Alert variant="success" className="mt-3">
                        <h4 className="alert-heading">Registration Successful!</h4>
                        <p>Your account has been created successfully. Redirecting to login page...</p>
                    </Alert>
                ) : (
                    <form onSubmit={handleSubmit} className="register-form">
                        {generalError && (
                            <Alert variant="danger" className="mt-2 mb-3">
                                <FaExclamationTriangle className="me-2" />
                                {generalError}
                            </Alert>
                        )}
                        
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
                                            className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                                            placeholder="Enter first name"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.firstName && <div className="invalid-feedback d-block">{errors.firstName}</div>}
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
                                            className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                                            placeholder="Enter your city"
                                            value={formData.city}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.city && <div className="invalid-feedback d-block">{errors.city}</div>}
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
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            placeholder="Enter email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <FaLock />
                                        </span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            placeholder="Enter password"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-secondary" 
                                            onClick={togglePasswordVisibility}
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
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
                                            className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                                            placeholder="Enter last name"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.lastName && <div className="invalid-feedback d-block">{errors.lastName}</div>}
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
                                            className={`form-control ${errors.street ? 'is-invalid' : ''}`}
                                            placeholder="Enter your street"
                                            value={formData.street}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.street && <div className="invalid-feedback d-block">{errors.street}</div>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Username</label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <FaUser />
                                        </span>
                                        <input
                                            type="text"
                                            name="userName"
                                            className={`form-control ${errors.userName ? 'is-invalid' : ''}`}
                                            placeholder="Enter your username"
                                            value={formData.userName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.userName && <div className="invalid-feedback d-block">{errors.userName}</div>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Confirm Password</label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <FaLock />
                                        </span>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                            placeholder="Confirm password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-secondary" 
                                            onClick={toggleConfirmPasswordVisibility}
                                        >
                                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}
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
                                            className={`form-control ${errors.contact ? 'is-invalid' : ''}`}
                                            placeholder="Enter phone number"
                                            value={formData.contact}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.contact && <div className="invalid-feedback d-block">{errors.contact}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="form-check mt-3">
                            <input type="checkbox" className="form-check-input" id="terms" required />
                            <label className="form-check-label" htmlFor="terms">
                                I agree to the Terms and Conditions
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary register-button mt-4"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <FaUserPlus className="me-2" />
                                    Create Account
                                </>
                            )}
                        </button>

                        <div className="login-link">
                            Already have an account?{' '}
                            <span onClick={() => navigate('/login')}>Sign in here</span>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default RegisterForm;