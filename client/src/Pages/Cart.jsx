import React from 'react';
import { Container, Row, Col, Card, Button, Table, Form } from 'react-bootstrap';
import { FaTrash, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();

  // Sample cart data - replace with actual data from your backend
  const cartItems = [
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
    },
    {
      id: 3,
      title: "1984",
      author: "George Orwell",
      price: 14.99,
      quantity: 1,
      image: "https://via.placeholder.com/100"
    }
  ];

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 5.99;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (id, newQuantity) => {
    // Implement quantity change logic
    console.log(`Change quantity of item ${id} to ${newQuantity}`);
  };

  const handleRemoveItem = (id) => {
    // Implement remove item logic
    console.log(`Remove item ${id}`);
  };

  const handleCheckout = () => {
    navigate('/order-summary');
  };

  return (
    <Container className="cart-page py-4">
      <h2 className="mb-4">Shopping Cart</h2>
      <Row>
        <Col lg={8}>
          <Card className="cart-items mb-4">
            <Card.Body>
              {cartItems.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img 
                              src={item.image} 
                              alt={item.title} 
                              className="cart-item-image me-3"
                            />
                            <div>
                              <h6 className="mb-0">{item.title}</h6>
                              <small className="text-muted">{item.author}</small>
                            </div>
                          </div>
                        </td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>
                          <Form.Select
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                            className="quantity-select"
                          >
                            {[1, 2, 3, 4, 5].map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </Form.Select>
                        </td>
                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                        <td>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <p>Your cart is empty</p>
                  <Button variant="primary" onClick={() => navigate('/')}>
                    Continue Shopping
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="cart-summary">
            <Card.Body>
              <h4 className="mb-4">Order Summary</h4>
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
                className="w-100"
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout <FaArrowRight className="ms-2" />
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart; 