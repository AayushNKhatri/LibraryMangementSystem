import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Verify.css';

const Verify = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Container className="verify-page py-5">
      <div className="verify-container">
        <Card className="verify-card">
          <Card.Body className="text-center">
            <div className="verify-icon pending">
              <FaEnvelope />
            </div>
            <h3 className="mb-3">Verify Your Email</h3>
            <p className="text-muted mb-4">
              Please check your email for the verification link.
            </p>
            <Button 
              variant="primary" 
              className="w-100"
              onClick={handleLogin}
            >
              Back to Login
            </Button>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Verify; 