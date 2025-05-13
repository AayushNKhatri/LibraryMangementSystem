import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Badge, ListGroup, Alert, Toast, ToastContainer } from 'react-bootstrap';
import { FaUser, FaShoppingBag, FaBell, FaHeart, FaEdit, FaTrash, FaExternalLinkAlt, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import './UserProfile.css';
import notificationService from '../api/notificationService';
import bookmarkService from '../api/bookmarkService';
import userService from '../api/userService';

const UserProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);
  const [bookmarkError, setBookmarkError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [hubConnection, setHubConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // User profile state
  const [userProfile, setUserProfile] = useState({
    userName: '',
    email: '',
    firstName: '',
    lastName: '',
    contact: '',
    city: '',
    street: ''
  });

  // Form data for user updates
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    firstName: '',
    lastName: '',
    contact: '',
    city: '',
    street: ''
  });

  useEffect(() => {
    // Load user profile data
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const userData = await userService.getCurrentUser();
        if (userData) {
          setUserProfile(userData);
          setFormData({
            userName: userData.userName || '',
            email: userData.email || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            contact: userData.contact || '',
            city: userData.city || '',
            street: userData.street || ''
          });
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();

    // Fetch notifications when component mounts
    fetchNotifications();
    
    // Fetch bookmarks/wishlist items
    fetchBookmarks();
    
    // Setup SignalR connection
    setupSignalRConnection();

    // Cleanup function to stop connection when component unmounts
    return () => {
      if (hubConnection && connectionStatus === 'connected') {
        hubConnection.stop()
          .then(() => console.log("SignalR disconnected."))
          .catch(err => console.error("Error stopping SignalR connection:", err));
      }
    };
  }, []);

  const setupSignalRConnection = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error("No auth token found. SignalR connection will fail.");
      return;
    }

    try {
      const userId = tokenUtils.getUserIdFromToken();
      if (!userId) {
        console.error("No user ID found in token. SignalR connection might not work properly.");
      }

      const connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5129/notificationhub", {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Retry strategy
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Set up event handlers before starting the connection
      connection.on("ReceiveNotification", (notification) => {
        console.log("Received notification:", notification);
        
        // Add notification to state
        setNotifications(prev => [notification, ...prev]);
        
        // Show toast notification
        setToastMessage(notification.message);
        setShowToast(true);
      });

      connection.on("ReceiveOrder", (order) => {
        console.log("Received order update:", order);
        setOrders(prev => [order, ...prev]);
      });

      // Set up connection status change handlers
      connection.onreconnecting(error => {
        console.log("SignalR reconnecting:", error);
        setConnectionStatus('reconnecting');
      });

      connection.onreconnected(connectionId => {
        console.log("SignalR reconnected. ConnectionId:", connectionId);
        setConnectionStatus('connected');
      });

      connection.onclose(error => {
        console.log("SignalR connection closed:", error);
        setConnectionStatus('disconnected');
      });

      // Start the connection
      await connection.start();
      console.log("SignalR Connected successfully.");
      setConnectionStatus('connected');
      setHubConnection(connection);
    } catch (err) {
      console.error("Error establishing SignalR connection:", err);
      setConnectionStatus('error');
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      console.log("Fetched notifications:", data);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchBookmarks = async () => {
    setIsLoadingBookmarks(true);
    setBookmarkError(null);
    try {
      const data = await bookmarkService.getAllBookmarks();
      setBookmarks(data);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
      setBookmarkError('Failed to load your wishlist. Please try again later.');
    } finally {
      setIsLoadingBookmarks(false);
    }
  };

  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      await bookmarkService.removeBookmark(bookmarkId);
      // Update local state
      setBookmarks(prevBookmarks => prevBookmarks.filter(bm => bm.bookmarkId !== bookmarkId));
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      alert('Failed to remove item from wishlist. Please try again.');
    }
  };

  const handleViewBook = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Update the local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

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
      const userId = tokenUtils.getUserIdFromToken();
      if (!userId) {
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
      
      // Make the API call to update the user
      await userService.updateUserProfile(userId, updateData);
      
      // Update was successful
      setUserProfile({
        ...userProfile,
        ...updateData
      });
      setUpdateSuccess(true);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setUpdateError(error.response?.data || 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
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

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading profile information...</p>
      </Container>
    );
  }

  return (
    <Container className="user-profile py-4">
      {/* Toast Notification for real-time updates */}
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
          <Toast.Header closeButton>
            <strong className="me-auto">Notification</strong>
            <small>Just now</small>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Connection Status Indicator (can be removed in production) */}
      <div className={`connection-status ${connectionStatus}`}>
        SignalR: {connectionStatus}
      </div>

      <Row>
        <Col lg={3}>
          <Card className="profile-sidebar mb-4">
            <Card.Body>
              <h4 className="text-center mb-3">{getFullName()}</h4>
              <p className="text-muted text-center">@{userProfile.userName}</p>
            </Card.Body>
            <ListGroup variant="flush">
              <ListGroup.Item 
                action 
                active={activeTab === 'profile'}
                onClick={() => setActiveTab('profile')}
              >
                <FaUser className="me-2" />
                Profile Information
              </ListGroup.Item>
              <ListGroup.Item 
                action 
                active={activeTab === 'orders'}
                onClick={() => setActiveTab('orders')}
              >
                <FaShoppingBag className="me-2" />
                My Orders
                <Badge bg="primary" className="ms-2">{orders.length}</Badge>
              </ListGroup.Item>
              <ListGroup.Item 
                action 
                active={activeTab === 'notifications'}
                onClick={() => setActiveTab('notifications')}
              >
                <FaBell className="me-2" />
                Notifications
                <Badge bg="danger" className="ms-2">
                  {notifications.filter(n => !n.read).length}
                </Badge>
              </ListGroup.Item>
              <ListGroup.Item 
                action 
                active={activeTab === 'wishlist'}
                onClick={() => setActiveTab('wishlist')}
              >
                <FaHeart className="me-2" />
                Wishlist
                <Badge bg="primary" className="ms-2">{bookmarks.length}</Badge>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        <Col lg={9}>
          <Card>
            <Card.Body>
              {/* Profile Information */}
              {activeTab === 'profile' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4>Profile Information</h4>
                    {isEditing ? (
                      <div className="d-flex gap-2">
                        <Button 
                          variant="secondary"
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="success"
                          onClick={handleSubmitProfile}
                          disabled={isUpdating}
                        >
                          {isUpdating ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="primary"
                        onClick={handleEditProfile}
                      >
                        <FaEdit className="me-2" />
                        Edit Profile
                      </Button>
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
                            value={isEditing ? formData.userName : userProfile.userName}
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
                            value={isEditing ? formData.email : userProfile.email}
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
                            value={isEditing ? formData.firstName : userProfile.firstName}
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
                            value={isEditing ? formData.lastName : userProfile.lastName}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Contact</Form.Label>
                          <Form.Control 
                            type="tel" 
                            name="contact"
                            value={isEditing ? formData.contact : userProfile.contact}
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
                            value={isEditing ? formData.city : userProfile.city}
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
                            value={isEditing ? formData.street : userProfile.street}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>
                </div>
              )}

              {/* Orders */}
              {activeTab === 'orders' && (
                <div>
                  <h4 className="mb-4">My Orders</h4>
                  {orders.length === 0 ? (
                    <div className="text-center py-5">
                      <FaShoppingBag size={48} className="text-muted mb-3" />
                      <h5 className="text-muted">No orders yet</h5>
                      <p>Your order history will appear here</p>
                      <Button 
                        variant="primary" 
                        onClick={() => navigate('/books')}
                      >
                        Start Shopping
                      </Button>
                    </div>
                  ) : (
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{order.date}</td>
                            <td>{order.items}</td>
                            <td>${order.total}</td>
                            <td>
                              <Badge bg={order.status === 'Delivered' ? 'success' : 'warning'}>
                                {order.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">Notifications</h4>
                    {notifications.filter(n => !n.read).length > 0 && (
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => {
                          // Mark all as read functionality could be implemented here
                          alert('Mark all as read functionality will be implemented soon.');
                        }}
                      >
                        Mark all as read
                      </Button>
                    )}
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="text-center py-5">
                      <FaBell size={48} className="text-muted mb-3" />
                      <h5 className="text-muted">No notifications yet</h5>
                      <p>Stay tuned for updates about your orders and activity</p>
                    </div>
                  ) : (
                    <ListGroup>
                      {notifications.map((notification, index) => (
                        <ListGroup.Item 
                          key={notification.id || index}
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="notification-content">
                              <div className="d-flex align-items-center mb-1">
                                <FaBell className={`me-2 ${!notification.read ? 'text-primary' : 'text-muted'}`} />
                                <h6 className="mb-0">{notification.title || 'Notification'}</h6>
                              </div>
                              <p className="mb-1">{notification.message}</p>
                              <small className="notification-date">
                                {notification.date ? new Date(notification.date).toLocaleString() : new Date().toLocaleString()}
                              </small>
                            </div>
                            {!notification.read && (
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </div>
              )}

              {/* Wishlist */}
              {activeTab === 'wishlist' && (
                <div>
                  <h4 className="mb-4">My Wishlist</h4>
                  
                  {isLoadingBookmarks ? (
                    <div className="text-center my-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading your wishlist...</p>
                    </div>
                  ) : bookmarkError ? (
                    <div className="alert alert-danger">{bookmarkError}</div>
                  ) : bookmarks.length === 0 ? (
                    <div className="text-center my-5">
                      <FaHeart size={48} className="text-muted mb-3" />
                      <h5 className="text-muted">Your wishlist is empty</h5>
                      <p>Browse books and add them to your wishlist</p>
                      <Button 
                        variant="primary" 
                        onClick={() => navigate('/books')}
                      >
                        Browse Books
                      </Button>
                    </div>
                  ) : (
                    <Row xs={1} md={2} lg={3} className="g-4">
                      {bookmarks.map(bookmark => (
                        <Col key={bookmark.bookmarkId}>
                          <Card className="h-100 wishlist-card">
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <Card.Title className="text-truncate" style={{ maxWidth: '80%' }}>
                                  {bookmark.book?.title || 'Untitled Book'}
                                </Card.Title>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => handleRemoveBookmark(bookmark.bookmarkId)}
                                >
                                  <FaTrash />
                                </Button>
                              </div>
                              
                              <div className="book-image-container mb-3">
                                <img 
                                  src={bookmark.book?.imageUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"} 
                                  alt={bookmark.book?.title || 'Book cover'} 
                                  className="img-fluid rounded"
                                  style={{ height: '150px', objectFit: 'cover', width: '100%' }}
                                />
                              </div>
                              
                              <Card.Text className="mb-2">
                                <small className="text-muted">
                                  {bookmark.book?.author || 'Unknown Author'}
                                </small>
                              </Card.Text>
                              
                              <Card.Text className="mb-3">
                                <span className="fw-bold">${bookmark.book?.price || 'N/A'}</span>
                              </Card.Text>
                              
                              <div className="d-grid">
                                <Button 
                                  variant="primary" 
                                  onClick={() => handleViewBook(bookmark.bookId)}
                                >
                                  <FaExternalLinkAlt className="me-2" />
                                  View Details
                                </Button>
                              </div>
                            </Card.Body>
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
