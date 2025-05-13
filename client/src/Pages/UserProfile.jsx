import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Nav, Tab, Badge, ListGroup } from 'react-bootstrap';
import { FaUser, FaShoppingBag, FaBell, FaHeart, FaEdit, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './UserProfile.css';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  // Sample user data - replace with actual data from your backend
  const userData = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 890",
    address: "123 Library Street, Booktown, BT 12345",
    joinDate: "January 2024",
    avatar: "https://via.placeholder.com/150"
  };

  // Sample orders data
  const orders = [
    { id: 1, date: "2024-03-15", total: 45.99, status: "Delivered", items: 3 },
    { id: 2, date: "2024-03-10", total: 29.99, status: "Processing", items: 2 },
    { id: 3, date: "2024-03-05", total: 15.99, status: "Delivered", items: 1 },
  ];

  // Sample notifications
  const notifications = [
    { id: 1, title: "Order Delivered", message: "Your order #123 has been delivered", date: "2024-03-15", read: false },
    { id: 2, title: "New Book Available", message: "A book from your wishlist is now available", date: "2024-03-14", read: true },
    { id: 3, title: "Special Offer", message: "Get 20% off on your next purchase", date: "2024-03-13", read: true },
  ];

  // Sample wishlist
  const wishlist = [
    { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 15.99, inStock: true },
    { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", price: 12.99, inStock: false },
    { id: 3, title: "1984", author: "George Orwell", price: 14.99, inStock: true },
  ];

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
                <Badge bg="primary" className="ms-2">3</Badge>
              </ListGroup.Item>
              <ListGroup.Item 
                action 
                active={activeTab === 'notifications'}
                onClick={() => setActiveTab('notifications')}
              >
                <FaBell className="me-2" />
                Notifications
                <Badge bg="danger" className="ms-2">1</Badge>
              </ListGroup.Item>
              <ListGroup.Item 
                action 
                active={activeTab === 'wishlist'}
                onClick={() => setActiveTab('wishlist')}
              >
                <FaHeart className="me-2" />
                Wishlist
                <Badge bg="primary" className="ms-2">3</Badge>
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
                        <th>Actions</th>
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
                          <td>
                            <Button variant="outline-primary" size="sm">
                              View Details
                            </Button>
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
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Book</th>
                        <th>Author</th>
                        <th>Price</th>
                        <th>Availability</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wishlist.map(book => (
                        <tr key={book.id}>
                          <td>{book.title}</td>
                          <td>{book.author}</td>
                          <td>${book.price}</td>
                          <td>
                            <Badge bg={book.inStock ? 'success' : 'warning'}>
                              {book.inStock ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                          </td>
                          <td>
                            <Button 
                              variant="primary" 
                              size="sm" 
                              className="me-2"
                              disabled={!book.inStock}
                            >
                              Add to Cart
                            </Button>
                            <Button variant="outline-danger" size="sm">
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
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