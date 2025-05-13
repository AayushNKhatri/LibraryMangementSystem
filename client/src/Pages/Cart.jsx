import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Table } from "react-bootstrap";
import { FaTrash, FaArrowRight, FaPlus, FaMinus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import orderService from "../api/OrderServer";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch cart items on component mount
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        const data = await orderService.getCartItems();
        setCartItems(data);
      } catch (error) {
        console.error("Error loading fetched cart items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCartItems();
  }, []);

  // Handle quantity increase
  const handleIncreaseChange = async (itemId) => {
    try {
      setLoading(true);
      const data = await orderService.increaseCartItems(itemId);
      setCartItems(data);
    } catch (error) {
      console.error("Error increasing cart item quantity:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle quantity decrease
  const handleDecreaseChange = async (itemId) => {
    try {
      setLoading(true);
      const data = await orderService.decreaseCartItems(itemId);
      setCartItems(data);
    } catch (error) {
      console.error("Error decreasing cart item quantity:", error);
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const handleRemoveItem = async (itemId) => {
    try {
      setLoading(true);
      const data = await orderService.removeCartItems(itemId);
      setCartItems(data);
    } catch (error) {
      console.error("Error removing cart item:", error);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.book?.price * item.count || 0),
    0
  );
  const discount = 100; // 10% discount or fixed value
  const total = subtotal - discount;

  // Proceed to checkout
  const handleCheckout = () => {
    navigate("/order-summary");
  };

  return (
    <Container className="cart-page py-4">
      <h2 className="mb-4">Shopping Cart</h2>
      <Row>
        <Col lg={8}>
          <Card className="cart-items mb-4">
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : cartItems.length > 0 ? (
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
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={item.image}
                              alt={item.book.title}
                              className="cart-item-image me-3"
                            />
                            <div>
                              <small className="text-muted">
                                {item.book.author}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>${item.book.price}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() =>
                                handleDecreaseChange(item.book.bookId)
                              }
                            >
                              <FaMinus />
                            </Button>
                            <span className="mx-2">{item.count}</span>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() =>
                                handleIncreaseChange(item.book.bookId)
                              }
                            >
                              <FaPlus />
                            </Button>
                          </div>
                        </td>
                        <td>${item.book.price * item.count}</td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveItem(item.book.bookId)}
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
                  <Button variant="primary" onClick={() => navigate("/")}>
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

              <div className="summary-item d-flex justify-content-between mb-3">
                <span>Discount (10%)</span>
                <span>${discount}</span>
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
