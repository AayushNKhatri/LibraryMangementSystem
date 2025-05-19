import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
  Badge,
  ListGroup,
  Alert,
  Toast,
  ToastContainer,
  Spinner,
  Image
} from "react-bootstrap";
import { FaUser, FaShoppingBag, FaBell, FaHeart, FaEdit, FaCheckCircle, FaTimes, FaTrash, FaCheck, FaBookOpen } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import "./UserProfile.css";
import userService from "../api/userService";
import orderService from "../api/OrderServer";
import notificationService from "../api/notificationService";
import signalRService from "../api/signalRService";
import bookmarkService from "../api/bookmarkService";

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState({
    userName: '',
    email: '',
    firstName: '',
    lastName: '',
    contact: '',
    city: '',
    street: ''
  });
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    firstName: '',
    lastName: '',
    contact: '',
    city: '',
    street: ''
  });
  const [orderData, setOrderData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Helper function to get user ID from token using jwt-decode
  const getUserId = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    try {
      // Use jwt-decode to properly decode the token
      const decodedToken = jwtDecode(token);
      return decodedToken.nameid || decodedToken.sub; // nameid is where .NET stores the user ID
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Handler for receiving real-time notifications
  const handleNewNotification = useCallback((notification) => {
    setNotifications(prev => {
      // Add the new notification to the beginning of the array
      const updated = [notification, ...prev];
      // Update unread count
      setUnreadCount(updated.filter(n => !n.read).length);
      return updated;
    });

    // Show toast notification
    showToastMessage(notification.message, "info");
  }, []);

  // Handler for notification read events
  const handleNotificationRead = useCallback((notificationId) => {
    setNotifications(prev => {
      const updated = prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      // Update unread count
      setUnreadCount(updated.filter(n => !n.read).length);
      return updated;
    });
  }, []);

  // Initialize SignalR connection
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    // Start SignalR connection
    const initializeSignalR = async () => {
      try {
        await signalRService.startConnection(token);

        // Register callbacks
        signalRService.onNotification('userProfile-notification', handleNewNotification);
        signalRService.onNotification('userProfile-read', handleNotificationRead);
      } catch (error) {
        console.error('Failed to initialize SignalR:', error);
      }
    };

    initializeSignalR();

    // Cleanup on unmount
    return () => {
      signalRService.removeNotificationCallback('userProfile-notification');
      signalRService.removeNotificationCallback('userProfile-read');
    };
  }, [handleNewNotification, handleNotificationRead]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // Get user by ID - this endpoint uses the token to identify the user
        const userData = await userService.getUserById();
        setUserProfile(userData);
        setFormData(userData);
      } catch (error) {
        console.error("Error loading user data:", error);
        showToastMessage("Failed to load user profile", "danger");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch order data
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setIsLoading(true);
        const data = await orderService.getOrderById();
        setOrderData(data || []);
      } catch (error) {
        console.error("Error loading orders:", error);
        setOrderData([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === 'orders') {
      fetchOrderData();
    }
  }, [activeTab]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (activeTab === 'notifications') {
        try {
          setNotificationsLoading(true);
          const data = await notificationService.getNotifications();
          setNotifications(data || []);
          setUnreadCount(data.filter(n => !n.read).length);
        } catch (error) {
          console.error("Error loading notifications:", error);
          setNotifications([]);
        } finally {
          setNotificationsLoading(false);
        }
      }
    };

    fetchNotifications();
  }, [activeTab]);

  // Fetch wishlist items
  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (activeTab === 'wishlist') {
        try {
          setWishlistLoading(true);
          const data = await bookmarkService.getAllBookmarks();
          setWishlistItems(data || []);
        } catch (error) {
          console.error("Error loading wishlist:", error);
          setWishlistItems([]);
          showToastMessage("Failed to load wishlist items", "danger");
        } finally {
          setWishlistLoading(false);
        }
      }
    };

    fetchWishlistItems();
  }, [activeTab]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Start editing profile
  const handleEditProfile = () => {
    setIsEditing(true);
    // Reset form data to current profile data
    setFormData({
      userName: userProfile.userName || '',
      email: userProfile.email || '',
      firstName: userProfile.firstName || '',
      lastName: userProfile.lastName || '',
      contact: userProfile.contact || '',
      city: userProfile.city || '',
      street: userProfile.street || ''
    });
    // Clear any previous success/error messages
    setUpdateSuccess(false);
    setUpdateError('');
  };

  // Cancel editing and reset form
  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      userName: userProfile.userName || '',
      email: userProfile.email || '',
      firstName: userProfile.firstName || '',
      lastName: userProfile.lastName || '',
      contact: userProfile.contact || '',
      city: userProfile.city || '',
      street: userProfile.street || ''
    });
    setUpdateSuccess(false);
    setUpdateError('');
  };

  // Submit profile updates
  const handleSubmitProfile = async () => {
    setIsUpdating(true);
    setUpdateError('');
    setUpdateSuccess(false);

    try {
      // No need to get userId from token - backend identifies user from token
      if (!localStorage.getItem('authToken')) {
        throw new Error('You must be logged in to update your profile');
      }

      // Prepare the update data according to the UpdateUserDto
      const updateData = {
        userName: formData.userName,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        contact: formData.contact,
        city: formData.city,
        street: formData.street
      };

      // Make the API call to update the user - userId not needed as parameter
      await userService.updateUserProfile(updateData);

      // Update was successful
      setUserProfile({
        ...userProfile,
        ...updateData
      });
      setUpdateSuccess(true);
      setIsEditing(false);
      showToastMessage("Profile updated successfully!", "success");
    } catch (error) {
      console.error('Failed to update profile:', error);
      setUpdateError(error.response?.data || 'Failed to update profile. Please try again.');
      showToastMessage("Failed to update profile. Please try again.", "danger");
    } finally {
      setIsUpdating(false);
    }
  };

  // Display toast message
  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Display full name
  const getFullName = () => {
    if (userProfile.firstName && userProfile.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`;
    } else if (userProfile.firstName) {
      return userProfile.firstName;
    } else if (userProfile.userName) {
      return userProfile.userName;
    }
    return 'User';
  };

  // Format address for display
  const getFormattedAddress = () => {
    const parts = [];
    if (userProfile.street) parts.push(userProfile.street);
    if (userProfile.city) parts.push(userProfile.city);
    return parts.join(', ');
  };

  const statusMap = {
    0: "Pending",
    1: "Completed",
    2: "Cancelled",
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      showToastMessage("Failed to mark notification as read", "danger");
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);

      // Update local state by removing the deleted notification
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      
      // If the deleted notification was unread, update the unread count
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      showToastMessage("Notification deleted successfully", "success");
    } catch (error) {
      console.error(`Error deleting notification:`, error);
      showToastMessage("Failed to delete notification", "danger");
    }
  };

  // Remove item from wishlist
  const handleRemoveFromWishlist = async (bookmarkId) => {
    try {
      await bookmarkService.removeBookmark(bookmarkId);

      // Update local state
      setWishlistItems(prev => prev.filter(item => item.bookmarkId !== bookmarkId));
      showToastMessage("Item removed from wishlist", "success");
    } catch (error) {
      console.error("Error removing item from wishlist:", error);
      showToastMessage("Failed to remove item from wishlist", "danger");
    }
  };

  if (isLoading && !userProfile.userName) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading profile information...</p>
      </Container>
    );
  }

  return (
    <Container className="user-profile py-4">
      {/* Toast Notification for real-time updates */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg={toastType}
          text={toastType === 'danger' ? 'white' : 'dark'}
        >
          <Toast.Header closeButton>
            <strong className="me-auto">Notification</strong>
            <small>Just now</small>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Row>
        <Col lg={3}>
          <Card className="profile-sidebar mb-4">
            <Card.Body className="text-center">
              <div className="profile-avatar mb-3">
                <div className="avatar-placeholder">
                  {userProfile.firstName?.charAt(0) || userProfile.userName?.charAt(0) || 'U'}
                </div>
              </div>
              <h4>{getFullName()}</h4>
              <p className="text-muted">{userProfile.email}</p>
            </Card.Body>
            <ListGroup variant="flush">
              <ListGroup.Item
                action
                active={activeTab === "profile"}
                onClick={() => setActiveTab("profile")}
              >
                <FaUser className="me-2" />
                Profile Information
              </ListGroup.Item>
              <ListGroup.Item
                action
                active={activeTab === "orders"}
                onClick={() => setActiveTab("orders")}
              >
                <FaShoppingBag className="me-2" />
                My Orders
                {orderData.length > 0 && (
                  <Badge bg="primary" className="ms-2">
                    {orderData.length}
                  </Badge>
                )}
              </ListGroup.Item>
              <ListGroup.Item
                action
                active={activeTab === "notifications"}
                onClick={() => setActiveTab("notifications")}
              >
                <FaBell className="me-2" />
                Notifications
                {unreadCount > 0 && (
                  <Badge bg="danger" className="ms-2">
                    {unreadCount}
                  </Badge>
                )}
              </ListGroup.Item>
              <ListGroup.Item
                action
                active={activeTab === "wishlist"}
                onClick={() => setActiveTab("wishlist")}
              >
                <FaHeart className="me-2" />
                Wishlist
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        <Col lg={9}>
          <Card>
            <Card.Body>
              {activeTab === "profile" && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4>Profile Information</h4>
                    {!isEditing ? (
                      <Button variant="primary" onClick={handleEditProfile}>
                        <FaEdit className="me-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div>
                        <Button variant="secondary" onClick={handleCancelEdit} className="me-2">
                          <FaTimes className="me-2" />
                          Cancel
                        </Button>
                        <Button
                          variant="success"
                          onClick={handleSubmitProfile}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <>
                              <Spinner as="span" size="sm" animation="border" className="me-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaCheckCircle className="me-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {updateSuccess && (
                    <Alert variant="success" className="d-flex align-items-center mb-4">
                      <FaCheckCircle className="me-2" />
                      Profile updated successfully!
                    </Alert>
                  )}

                  {updateError && (
                    <Alert variant="danger" className="mb-4">
                      {updateError}
                    </Alert>
                  )}

                  <Form>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Username</Form.Label>
                          <Form.Control
                            type="text"
                            name="userName"
                            value={isEditing ? formData.userName : userProfile.userName || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={isEditing ? formData.email : userProfile.email || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="firstName"
                            value={isEditing ? formData.firstName : userProfile.firstName || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="lastName"
                            value={isEditing ? formData.lastName : userProfile.lastName || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Phone</Form.Label>
                          <Form.Control
                            type="tel"
                            name="contact"
                            value={isEditing ? formData.contact : userProfile.contact || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>City</Form.Label>
                          <Form.Control
                            type="text"
                            name="city"
                            value={isEditing ? formData.city : userProfile.city || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>Street Address</Form.Label>
                          <Form.Control
                            type="text"
                            name="street"
                            value={isEditing ? formData.street : userProfile.street || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    {isEditing && (
                      <div className="form-text text-muted mb-3">
                        Your personal information is securely stored and will not be shared with third parties.
                      </div>
                    )}
                  </Form>
                </div>
              )}

              {activeTab === "orders" && (
                <div>
                  <h4 className="mb-4">My Orders</h4>
                  {isLoading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading orders...</span>
                      </Spinner>
                      <p className="mt-3">Loading your orders...</p>
                    </div>
                  ) : orderData.length === 0 ? (
                    <Alert variant="info">
                      You don't have any orders yet. Start shopping to see your orders here!
                    </Alert>
                  ) : (
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Claim Code</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderData.map((order) => (
                          <tr key={order.orderId}>
                            <td>{order.orderId.substring(0, 8)}</td>
                            <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                            <td>${order.totalAmount.toFixed(2)}</td>
                            <td>
                              <Badge
                                bg={
                                  statusMap[order.orderStatus] === "Completed"
                                    ? "success"
                                    : statusMap[order.orderStatus] === "Pending"
                                    ? "warning"
                                    : "danger"
                                }
                              >
                                {statusMap[order.orderStatus] || "Unknown"}
                              </Badge>
                            </td>
                            <td>
                              <code>{order.claimsCode}</code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">Notifications</h4>
                    {unreadCount > 0 && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          // Mark all as read functionality would go here
                          showToastMessage("This feature is coming soon!", "info");
                        }}
                      >
                        <FaCheck className="me-1" />
                        Mark all as read
                      </Button>
                    )}
                  </div>

                  {notificationsLoading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading notifications...</span>
                      </Spinner>
                      <p className="mt-3">Loading your notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <Alert variant="info">
                      <FaBell className="me-2" />
                      You have no notifications at this time.
                    </Alert>
                  ) : (
                    <ListGroup variant="flush" className="notification-list">
                      {notifications.map((notification) => (
                        <ListGroup.Item
                          key={notification.id}
                          className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <div className="notification-header">
                                <strong>{notification.title || 'Notification'}</strong>
                                {!notification.isRead && (
                                  <Badge bg="danger" pill className="ms-2">
                                    New
                                  </Badge>
                                )}
                              </div>
                              <p className="notification-message mb-1">
                                {notification.notificationDescription || notification.message}
                              </p>
                              <small className="text-muted">
                                {new Date(notification.notificationDate || notification.date).toLocaleString()}
                              </small>
                            </div>
                            <div className="notification-actions">
                              {!notification.isRead && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  title="Mark as read"
                                >
                                  <FaCheck />
                                </Button>
                              )}
                              <Button
                                variant="link"
                                size="sm"
                                className="text-danger"
                                title="Delete"
                                onClick={() => handleDeleteNotification(notification.id)}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </div>
              )}

              {activeTab === "wishlist" && (
                <div>
                  <h4 className="mb-4">My Wishlist</h4>
                  {wishlistLoading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading wishlist...</span>
                      </Spinner>
                      <p className="mt-3">Loading your wishlist items...</p>
                    </div>
                  ) : wishlistItems.length === 0 ? (
                    <Alert variant="info">
                      <FaHeart className="me-2" />
                      Your wishlist is empty. Browse our book collection and add items to your wishlist!
                    </Alert>
                  ) : (
                    <Row xs={1} md={2} className="g-4">
                      {wishlistItems.map((item) => (
                        <Col key={item.bookmarkId}>
                          <Card className="h-100 wishlist-item">
                            <Row className="g-0">
                              <Col md={4} className="d-flex align-items-center justify-content-center p-2">
                                {item.book && item.book.image ? (
                                  <Image
                                    src={item.book.image.startsWith('http') ? item.book.image : `http://localhost:5129/uploads/${item.book.image}`}
                                    alt={item.book.title}
                                    className="img-fluid rounded"
                                    style={{ height: '150px', objectFit: 'cover' }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
                                    }}
                                  />
                                ) : (
                                  <div className="book-placeholder d-flex align-items-center justify-content-center bg-light rounded" style={{ height: '150px', width: '100px' }}>
                                    <FaBookOpen size={32} className="text-secondary" />
                                  </div>
                                )}
                              </Col>
                              <Col md={8}>
                                <Card.Body>
                                  <Card.Title className="text-truncate">{item.book?.title || 'Unknown Title'}</Card.Title>
                                  <Card.Subtitle className="mb-2 text-muted">{item.book?.authorNamePrimary || 'Unknown Author'}</Card.Subtitle>
                                  <Card.Text className="small text-muted mb-2 text-truncate">
                                    {item.book?.publisher || 'Unknown Publisher'}
                                  </Card.Text>
                                  <div className="d-flex justify-content-between align-items-center mt-3">
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      href={`/book/${item.bookId}`}
                                    >
                                      View Details
                                    </Button>
                                    <div>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleRemoveFromWishlist(item.bookmarkId)}
                                        title="Remove from wishlist"
                                      >
                                        <FaTrash />
                                      </Button>
                                    </div>
                                  </div>
                                </Card.Body>
                              </Col>
                            </Row>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile;
