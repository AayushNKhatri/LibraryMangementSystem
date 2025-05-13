import React, { useState, useEffect } from "react";
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
} from "react-bootstrap";
import { FaUser, FaShoppingBag, FaBell, FaHeart, FaEdit } from "react-icons/fa";
import "./UserProfile.css";
import userService from "../api/UserService";
import orderService from "../api/OrderServer";

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await orderService.getCartItems();
        setUserData(data);
      } catch (error) {
        console.error("Error loading fetched cart items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchOrderData = async (userId) => {
      try {
        setLoading(true);
        const data = await orderService.getOrderById(userId);
        setOrderData(data);
      } catch (error) {
        console.error("Error loading fetched cart items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderData();
  }, []);

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const updatedUserData = {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        contact: userInfo.contact,
        city: userInfo.city,
        userId: userInfo.userId, // Ensure user ID is included
      };

      const response = await userService.updateUser(updatedUserData);
      setUserData(response.data);
      setIsEditing(false); // Disable editing after saving
    } catch (error) {
      console.error("Error updating user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusMap = {
    0: "Pending",
    1: "Completed",
    2: "Cancelled",
  };
  const userInfo = userData.length > 0 ? userData[0].user : {};

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
            <Card.Body className="text-center">
              <div className="profile-avatar mb-3">
                <img alt="Profile" className="rounded-circle" />
              </div>
              <h4>{`${userInfo.firstName || ""} ${
                userInfo.lastName || ""
              }`}</h4>
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
                <Badge bg="primary" className="ms-2">
                  3
                </Badge>
              </ListGroup.Item>
              <ListGroup.Item
                action
                active={activeTab === "notifications"}
                onClick={() => setActiveTab("notifications")}
              >
                <FaBell className="me-2" />
                Notifications
                <Badge bg="danger" className="ms-2">
                  1
                </Badge>
              </ListGroup.Item>
              <ListGroup.Item
                action
                active={activeTab === "wishlist"}
                onClick={() => setActiveTab("wishlist")}
              >
                <FaHeart className="me-2" />
                Wishlist
                <Badge bg="primary" className="ms-2">
                  3
                </Badge>
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
                    <Button
                      variant={isEditing ? "success" : "primary"}
                      onClick={
                        isEditing ? handleSaveChanges : () => setIsEditing(true)
                      }
                    >
                      <FaEdit className="me-2" />
                      {isEditing ? "Save Changes" : "Edit Profile"}
                    </Button>
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
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            defaultValue={userInfo.firstName || ""}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            defaultValue={userInfo.email || ""}
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
                            defaultValue={userInfo.contact || ""}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Address</Form.Label>
                          <Form.Control
                            type="text"
                            defaultValue={userInfo.city}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>
                </div>
              )}
              {activeTab === "orders" && (
                <div>
                <h4 className="mb-4">My Orders</h4>
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
                        <td>{order.orderId}</td>
                        <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                        <td>${order.totalAmount}</td>
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
                        <td>{order.claimsCode}</td>
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
