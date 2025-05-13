import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Badge, ListGroup } from 'react-bootstrap';
import { FaUser, FaShoppingBag, FaBell, FaHeart, FaEdit, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import './UserProfile.css';
import notificationService from '../api/notificationService';
import bookmarkService from '../api/bookmarkService';

const UserProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);
  const [bookmarkError, setBookmarkError] = useState(null);

  // Sample user data - replace with actual data from your backend
  const userData = {
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: 'https://via.placeholder.com/150',
  };

  useEffect(() => {
    // Fetch notifications when component mounts
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    
    // Fetch bookmarks/wishlist items
    fetchBookmarks();
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error("No auth token found. SignalR connection will fail.");
      return;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5129/notificationhub", {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        console.log("SignalR Connected.");

        connection.on("ReceiveNotification", (notification) => {
          console.log("Received notification:", notification);
          setNotifications(prev => [notification, ...prev]);
        });

        connection.on("ReceiveOrder", (order) => {
          console.log("Received order update:", order);
          setOrders(prev => [order, ...prev]);
        });
      })
      .catch(err => {
        console.error("SignalR Connection Error:", err);
        // Optionally try to reconnect with HTTP instead of HTTPS if that's the issue
        if (err.message && err.message.includes("https")) {
          console.log("Trying alternative connection method...");
          // Could implement fallback connection here
        }
      });

    return () => {
      if (connection.state === signalR.HubConnectionState.Connected) {
        connection.stop()
          .catch(err => console.error("Error stopping connection:", err));
      }
    };
  }, []);

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

  return (
    <Container className="user-profile py-4">
      <Row>
        <Col lg={3}>
          <Card className="profile-sidebar mb-4">
            <Card.Body className="text-center">
              <div className="profile-avatar mb-3">
                <img src={userData.avatar} alt="Profile" className="rounded-circle" />
              </div>
              <h4>{userData.name}</h4>
              <p className="text-muted">Member since {userData.joinDate}</p>
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
                    <Button 
                      variant={isEditing ? "success" : "primary"}
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <FaEdit className="me-2" />
                      {isEditing ? "Save Changes" : "Edit Profile"}
                    </Button>
                  </div>
                  <Form>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control 
                            type="text" 
                            defaultValue={userData.name}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control 
                            type="email" 
                            defaultValue={userData.email}
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
                            defaultValue={userData.phone}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Address</Form.Label>
                          <Form.Control 
                            type="text" 
                            defaultValue={userData.address}
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
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div>
                  <h4 className="mb-4">Notifications</h4>
                  <ListGroup>
                    {notifications.map(notification => (
                      <ListGroup.Item 
                        key={notification.id}
                        className={!notification.read ? 'unread' : ''}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">{notification.title}</h6>
                            <p className="mb-1">{notification.message}</p>
                            <small className="text-muted">{notification.date}</small>
                          </div>
                          {!notification.read && (
                            <Badge bg="primary">New</Badge>
                          )}
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
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
