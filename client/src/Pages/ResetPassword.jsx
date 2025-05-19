import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import userService from '../api/userService';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: ''
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Extract token and email from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  const encodedEmail = queryParams.get('email');

  useEffect(() => {
    if (!token) {
      setMessage({
        type: 'danger',
        text: 'Reset token is missing. Please use the link from your email.'
      });
    }

    if (encodedEmail) {
      try {
        // Decode the base64url encoded email
        const decodedEmail = atob(encodedEmail.replace(/-/g, '+').replace(/_/g, '/'));
        setFormData(prev => ({ ...prev, email: decodedEmail }));
      } catch (error) {
        console.error('Error decoding email:', error);
      }
    }
  }, [token, encodedEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear password error when user types
    if (name === 'newPassword' || name === 'confirmPassword') {
      setPasswordError('');

      // Check password strength when typing new password
      if (name === 'newPassword') {
        checkPasswordStrength(value);
      }

      // Check if passwords match in real-time
      if (name === 'confirmPassword' && formData.newPassword && value) {
        if (formData.newPassword !== value) {
          setPasswordError('Passwords do not match');
        }
      } else if (name === 'newPassword' && formData.confirmPassword) {
        if (value !== formData.confirmPassword) {
          setPasswordError('Passwords do not match');
        }
      }
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Check password strength
  const checkPasswordStrength = (password) => {
    // Initialize score
    let score = 0;
    let message = '';
    let color = '';

    if (!password) {
      setPasswordStrength({ score: 0, message: '', color: '' });
      return;
    }

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Complexity checks
    if (/[0-9]/.test(password)) score += 1; // Has number
    if (/[a-z]/.test(password)) score += 1; // Has lowercase
    if (/[A-Z]/.test(password)) score += 1; // Has uppercase
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // Has special char

    // Set message and color based on score
    if (score < 3) {
      message = 'Weak';
      color = 'danger';
    } else if (score < 5) {
      message = 'Medium';
      color = 'warning';
    } else {
      message = 'Strong';
      color = 'success';
    }

    setPasswordStrength({ score, message, color });
  };

  const validateForm = () => {
    // Check if passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }

    // Check password length only - minimum 8 characters
    if (formData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!token) {
      setMessage({
        type: 'danger',
        text: 'Reset token is missing. Please use the link from your email.'
      });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const resetData = {
        email: formData.email,
        newPassword: formData.newPassword
      };

      await userService.resetPassword(resetData, token);

      setMessage({
        type: 'success',
        text: 'Password has been reset successfully!'
      });

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      console.error('Reset password error:', error);
      setMessage({
        type: 'danger',
        text: error.response?.data || 'Failed to reset password. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white text-center py-3">
              <h3>Reset Password</h3>
            </Card.Header>
            <Card.Body className="p-4">
              {message.text && (
                <Alert variant={message.type} className="mb-4">
                  {message.text}
                </Alert>
              )}

              {!token && (
                <Alert variant="warning" className="mb-4">
                  Invalid or missing reset token. Please use the link from your email.
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                  {formData.newPassword && (
                    <div className="mt-1">
                      <div className="d-flex align-items-center">
                        <div className="me-2">Password strength:</div>
                        <div className={`text-${passwordStrength.color}`}>
                          {passwordStrength.message}
                        </div>
                      </div>
                      <div className="progress mt-1" style={{ height: '5px' }}>
                        <div
                          className={`progress-bar bg-${passwordStrength.color}`}
                          role="progressbar"
                          style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                          aria-valuenow={(passwordStrength.score / 6) * 100}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                      <small className="text-muted mt-1 d-block">
                        Use at least 8 characters with a mix of uppercase, lowercase, numbers, and special characters
                      </small>
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={toggleConfirmPasswordVisibility}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                  {passwordError && (
                    <Form.Text className="text-danger">
                      {passwordError}
                    </Form.Text>
                  )}
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting || !token}
                    className="py-2"
                  >
                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </div>
              </Form>

              <div className="text-center mt-4">
                <p>
                  Remember your password? <Link to="/login" className="text-primary">Login</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword;
