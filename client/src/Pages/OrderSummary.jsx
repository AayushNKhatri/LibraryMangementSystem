import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
} from "react-bootstrap";
import { FaCheck, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./OrderSummary.css";
import orderService from "../api/OrderServer";

const OrderSummary = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [summaryItems, setSummaryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        const data = await orderService.getCartItems();
        setSummaryItems(data);
      } catch (error) {
        console.error("Error loading fetched cart items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCartItems();
  }, []);

  const userInfo = summaryItems.length > 0 ? summaryItems[0].user : {};

  const subtotal = summaryItems.reduce(
    (sum, item) => sum + (item.book?.price * item.count || 0),
    0
  );
  const shipping = 10; // Example fixed shipping cost
  const tax = subtotal * 0.1; // Example 10% tax
  const total = subtotal + shipping + tax;

  const handleConfirmOrder = () => {
    console.log("Order confirmed");
  };

  return (
    <Container className="order-summary py-4">
      <h2 className="mb-4">Order Summary</h2>
      <Row>
        <Col lg={8}>
          {/* Shipping Information */}
          <Card className="mb-4">
            <Card.Body>
              <h4 className="mb-4">User Information</h4>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={`${userInfo.firstName || ""} ${
                        userInfo.lastName || ""
                      }`}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Contact</Form.Label>
                    <Form.Control
                      type="tel"
                      value={userInfo.contact || ""}
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      value={userInfo.city || ""}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Street</Form.Label>
                    <Form.Control
                      type="text"
                      value={userInfo.street || ""}
                      readOnly
                    />
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
                  {summaryItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.book?.title || "N/A"}</td>
                      <td>${item.book?.price || 0}</td>
                      <td>{item.count}</td>
                      <td>${item.book?.price * item.count || 0}</td>
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
              <div className="summary-item d-flex justify-content-between mb-3">
                <span>Discount (10%)</span>
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
                {isProcessing ? "Processing..." : "Confirm Order"}{" "}
                <FaCheck className="ms-2" />
              </Button>
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => navigate("/cart")}
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
