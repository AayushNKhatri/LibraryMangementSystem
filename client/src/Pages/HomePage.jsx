import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const HomePage = () => {
  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">Welcome to Kitaab Mitra</h1>
          <p className="text-center lead">Your one-stop destination for all books</p>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Browse Books</Card.Title>
              <Card.Text>
                Explore our vast collection of books from various genres.
              </Card.Text>
              <Link to="/books">
                <Button variant="primary">Browse Now</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Latest Announcements</Card.Title>
              <Card.Text>
                Stay updated with our latest news and promotions.
              </Card.Text>
              <Link to="/announcements">
                <Button variant="primary">View Announcements</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>My Account</Card.Title>
              <Card.Text>
                Manage your profile, orders, and wishlist.
              </Card.Text>
              <Link to="/account">
                <Button variant="primary">Go to Account</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
