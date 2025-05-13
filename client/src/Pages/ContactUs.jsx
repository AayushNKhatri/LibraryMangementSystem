import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import './ContactUs.css';

const ContactUs = () => {
  // Function to handle email redirection
  const handleEmailClick = () => {
    window.location.href = `mailto:aryanpradhan773@gmail.com`;
  };

  return (
    <div className="contact-us-page py-5">
      <Container>
        <Row className="mb-5 text-center">
          <Col>
            <h1 className="display-4 fw-bold text-primary mb-3">Contact Us</h1>
            <p className="lead text-muted">We'd love to hear from you. Get in touch with our team.</p>
          </Col>
        </Row>

        <Row className="mb-5">
          <Col lg={8} className="mx-auto">
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-5">
                <h2 className="h3 mb-4 text-center">How Can We Help?</h2>
                
                <div className="contact-item text-center p-4 mx-auto" style={{ maxWidth: '400px' }}>
                  <div className="icon-wrapper mb-3">
                    <FaEnvelope className="contact-icon" />
                  </div>
                  <h5>Email Us</h5>
                  <p className="text-muted mb-3">For any inquiries, support, or business proposals</p>
                  <Button 
                    variant="outline-primary" 
                    className="rounded-pill px-4"
                    onClick={handleEmailClick}
                  >
                    Send Email
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col lg={8} className="mx-auto">
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-5">
                <Row>
                  <Col md={6} className="mb-4 mb-md-0">
                    <h3 className="h4 mb-4">Our Location</h3>
                    <div className="d-flex mb-3">
                      <FaMapMarkerAlt className="text-primary mt-1 me-3" size={20} />
                      <div>
                        <p className="mb-0">Thapathali, Kathmandu</p>
                        <p className="mb-0">Nepal</p>
                      </div>
                    </div>
                    <div className="d-flex mb-3">
                      <FaPhone className="text-primary mt-1 me-3" size={20} />
                      <p className="mb-0">+977-9704787043</p>
                    </div>
                  </Col>
                  
                  <Col md={6}>
                    <h3 className="h4 mb-4">Connect With Us</h3>
                    <p className="text-muted mb-4">Follow us on social media for updates, book recommendations, and literary discussions.</p>
                    <div className="d-flex social-icons">
                      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="me-3">
                        <FaFacebook size={24} />
                      </a>
                      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="me-3">
                        <FaTwitter size={24} />
                      </a>
                      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="me-3">
                        <FaInstagram size={24} />
                      </a>
                      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                        <FaLinkedin size={24} />
                      </a>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ContactUs; 