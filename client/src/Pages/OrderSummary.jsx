import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form } from 'react-bootstrap';
import { FaCheck, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './OrderSummary.css';

const OrderSummary = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Sample order data - replace with actual data from your backend
  const orderItems = [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      price: 15.99,
      quantity: 1,
      image: "https://via.placeholder.com/100"
    },
    {
      id: 2,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      price: 12.99,
      quantity: 2,
      image: "https://via.placeholder.com/100"
    }
  ];

  // Sample shipping info - replace with actual user data
  const shippingInfo = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 890",
    address: "123 Library Street, Booktown, BT 12345"
  };

  const subtotal = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 5.99;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  const handleConfirmOrder = () => {
    setIsProcessing(true);
    // Implement order confirmation logic
    setTimeout(() => {
      setIsProcessing(false);
      // Navigate to success page or show success message
      alert('Order placed successfully!');
      navigate('/');
    }, 2000);
  };

  return (
    <Container className="order-summary py-4">
      <h2 className="mb-4">Order Summary</h2>
      <Row>
        <Col lg={8}>
          {/* Shipping Information */}
          <Card className="mb-4">
            <Card.Body>
              <h4 className="mb-4">Shipping Information</h4>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control type="text" value={shippingInfo.name} readOnly />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" value={shippingInfo.email} readOnly />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control type="tel" value={shippingInfo.phone} readOnly />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control type="text" value={shippingInfo.address} readOnly />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Order Items */}
          <Card>
            <Card.Body>
              <h4 className="mb-4">Order Items</h4>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="order-item-image me-3"
                          />
                          <div>
                            <h6 className="mb-0">{item.title}</h6>
                            <small className="text-muted">{item.author}</small>
                          </div>
                        </div>
                      </td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="order-summary-card">
            <Card.Body>
              <h4 className="mb-4">Order Total</h4>
              <div className="summary-item d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-item d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="summary-item d-flex justify-content-between mb-3">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <hr />
              <div className="summary-item d-flex justify-content-between mb-4">
                <strong>Total</strong>
                <strong>${total.toFixed(2)}</strong>
              </div>
              <Button 
                variant="primary" 
                className="w-100 mb-3"
                onClick={handleConfirmOrder}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Confirm Order'} <FaCheck className="ms-2" />
              </Button>
              <Button 
                variant="outline-secondary" 
                className="w-100"
                onClick={() => navigate('/cart')}
                disabled={isProcessing}
              >
                <FaArrowLeft className="me-2" /> Back to Cart
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderSummary; 