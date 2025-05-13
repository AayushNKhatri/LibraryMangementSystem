import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaBook, FaUsers, FaLightbulb, FaHeart } from 'react-icons/fa';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-us-page py-5">
      <Container>
        <Row className="mb-5 text-center">
          <Col>
            <h1 className="display-4 fw-bold text-primary mb-3">About Kitaab Mitra</h1>
            <p className="lead text-muted">Your trusted partner in the world of books and literature</p>
          </Col>
        </Row>

        <Row className="mb-5">
          <Col lg={6} className="mb-4 mb-lg-0">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-5">
                <h2 className="h3 mb-4">Our Story</h2>
                <p>
                  Founded in 2020, Kitaab Mitra began with a simple mission: to make quality books accessible to everyone. 
                  What started as a small collection of books has now grown into a comprehensive library management system 
                  serving thousands of book lovers across the country.
                </p>
                <p>
                  Our team of passionate readers and tech enthusiasts work together to create an 
                  exceptional book discovery and management experience for our community.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-5">
                <h2 className="h3 mb-4">Our Mission</h2>
                <p>
                  At Kitaab Mitra, we believe that books have the power to transform lives. Our mission is to 
                  foster a love for reading by creating a user-friendly platform that connects readers with their 
                  next favorite book.
                </p>
                <p>
                  We strive to build a community where knowledge is shared, stories are celebrated, and the joy of 
                  reading is accessible to all, regardless of geographic or economic barriers.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-5">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-5">
                <h2 className="h3 mb-4 text-center">What Sets Us Apart</h2>
                <Row className="g-4 mt-2">
                  <Col md={3} sm={6}>
                    <div className="text-center">
                      <FaBook className="text-primary mb-3" size={40} />
                      <h5>Vast Collection</h5>
                      <p className="text-muted">Access to thousands of titles across various genres</p>
                    </div>
                  </Col>
                  <Col md={3} sm={6}>
                    <div className="text-center">
                      <FaUsers className="text-primary mb-3" size={40} />
                      <h5>Community</h5>
                      <p className="text-muted">A growing community of passionate readers and book lovers</p>
                    </div>
                  </Col>
                  <Col md={3} sm={6}>
                    <div className="text-center">
                      <FaLightbulb className="text-primary mb-3" size={40} />
                      <h5>Personalized</h5>
                      <p className="text-muted">Smart recommendations based on your reading preferences</p>
                    </div>
                  </Col>
                  <Col md={3} sm={6}>
                    <div className="text-center">
                      <FaHeart className="text-primary mb-3" size={40} />
                      <h5>User-Focused</h5>
                      <p className="text-muted">Designed with reader experience as our top priority</p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-5 text-center">
                <h2 className="h3 mb-4">Join Our Journey</h2>
                <p className="mb-4">
                  We're continuously evolving and improving Kitaab Mitra to better serve our community. 
                  Whether you're a casual reader or a book enthusiast, we invite you to be part of our story.
                </p>
                <p className="lead fw-bold text-primary">
                  Happy Reading!
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AboutUs; 