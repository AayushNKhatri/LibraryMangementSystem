import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Table, Toast, ToastContainer } from "react-bootstrap";
import { FaTrash, FaArrowRight, FaPlus, FaMinus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import orderService from "../api/OrderServer";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [processingItemId, setProcessingItemId] = useState(null);

  // Show toast notification
  const showNotification = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Fetch cart items on component mount
  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const data = await orderService.getCartItems();
      setCartItems(data || []);

      // Fetch order history to calculate discount
      try {
        const orders = await orderService.getOrderById();
        const completed = orders ? orders.filter(order => order.orderStatus === 2).length : 0;
        setCompletedOrders(completed);
      } catch (error) {
        console.error("Error fetching order history:", error);
      }
    } catch (error) {
      console.error("Error loading fetched cart items:", error);
      setCartItems([]);
      showNotification("Failed to load cart items", "danger");
    } finally {
      setLoading(false);
    }
  };

  // Handle quantity increase
  const handleIncreaseChange = async (itemId) => {
    try {
      setProcessingItemId(itemId);
      await orderService.increaseCartItems(itemId);
      // Refresh cart items after update
      await fetchCartItems();
      showNotification("Quantity updated successfully");
    } catch (error) {
      console.error("Error increasing cart item quantity:", error);
      // Display the specific error message from the server
      showNotification(error.message || "Failed to update quantity", "danger");
    } finally {
      setProcessingItemId(null);
    }
  };

  // Handle quantity decrease
  const handleDecreaseChange = async (itemId) => {
    try {
      setProcessingItemId(itemId);
      await orderService.decreaseCartItems(itemId);
      // Refresh cart items after update
      await fetchCartItems();
      showNotification("Quantity updated successfully");
    } catch (error) {
      console.error("Error decreasing cart item quantity:", error);
      showNotification(error.message || "Failed to update quantity", "danger");
    } finally {
      setProcessingItemId(null);
    }
  };

  // Remove item from cart
  const handleRemoveItem = async (itemId) => {
    if (window.confirm("Are you sure you want to remove this item from your cart?")) {
      try {
        setProcessingItemId(itemId);
        await orderService.removeCartItems(itemId);
        // Refresh cart items after removal
        await fetchCartItems();
        showNotification("Item removed from cart successfully");
      } catch (error) {
        console.error("Error removing cart item:", error);
        showNotification("Failed to remove item from cart", "danger");
      } finally {
        setProcessingItemId(null);
      }
    }
  };

  // Calculate discount based on server logic
  const calculateDiscount = () => {
    // Get total number of books
    const totalBooks = cartItems.reduce((sum, item) => sum + item.count, 0);

    let discountRate = 0;

    // Apply 5% discount if 5 or more books
    if (totalBooks >= 5) {
      discountRate += 0.05;
    }

    // Apply additional 10% discount if 10 or more completed orders
    if (completedOrders >= 10) {
      discountRate += 0.10;
    }

    return discountRate;
  };

  // We no longer need to fetch inventory data separately as it's included in the book object

  const subtotal = cartItems.reduce(
    (sum, item) => {
      // Get price from the first inventory item in the book's inventories array
      const price = item.book?.inventories?.[0]?.price || 0;
      return sum + (price * item.count);
    },
    0
  );

  const discountRate = calculateDiscount();
  const discountAmount = subtotal * discountRate;
  const total = subtotal - discountAmount;

  // Proceed to checkout
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      showNotification("Your cart is empty", "danger");
      return;
    }

    try {
      setLoading(true);
      const response = await orderService.addOrder();
      // Navigate to order confirmation page with the order data
      navigate("/order-confirmation", { state: { order: response } });
    } catch (error) {
      console.error("Error creating order:", error);
      const errorMessage = error.response?.data?.message || 
                           error.message || 
                           "Failed to create order. Please check item availability.";
      showNotification(errorMessage, "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="cart-page py-4">
      {/* Toast notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg={toastType}
          className="text-white"
        >
          <Toast.Header>
            <strong className="me-auto">Cart</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

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
                      <tr key={item.cartId || item.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={item.book?.image ? `http://localhost:5129/uploads/${item.book.image}` : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100"}
                              alt={item.book?.title}
                              className="cart-item-image me-3"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100";
                              }}
                            />
                            <div>
                              <h6 className="mb-0">{item.book?.title}</h6>
                              <small className="text-muted">
                                {item.book?.authorNamePrimary}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          ${(item.book?.inventories?.[0]?.price || 0).toFixed(2)}
                          {item.book?.inventories?.[0]?.isOnSale && (
                            <span className="ms-2 badge bg-danger">Sale</span>
                          )}
                        </td>
                        <td>
                          <div className="quantity-controls d-flex align-items-center">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleDecreaseChange(item.bookId)}
                              disabled={processingItemId === item.bookId || item.count <= 1}
                            >
                              {processingItemId === item.bookId ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : (
                                <FaMinus />
                              )}
                            </Button>
                            <span className="mx-2">{item.count}</span>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleIncreaseChange(item.bookId)}
                              disabled={processingItemId === item.bookId}
                            >
                              {processingItemId === item.bookId ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : (
                                <FaPlus />
                              )}
                            </Button>
                          </div>
                        </td>
                        <td>
                          ${((item.book?.inventories?.[0]?.price || 0) * item.count).toFixed(2)}
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveItem(item.bookId)}
                            disabled={processingItemId === item.bookId}
                          >
                            {processingItemId === item.bookId ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : (
                              <FaTrash />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <p>Your cart is empty</p>
                  <Button variant="primary" onClick={() => navigate("/books")}>
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
                <span>Discount ({(discountRate * 100).toFixed(0)}%)</span>
                <span>${discountAmount.toFixed(2)}</span>
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
