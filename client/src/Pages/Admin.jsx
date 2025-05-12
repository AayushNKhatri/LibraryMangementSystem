import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal, Nav, Tab, Badge, Pagination } from 'react-bootstrap';
import { FaBook, FaShoppingCart, FaTag, FaBullhorn, FaBox, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaUsers, FaDollarSign, FaExclamationTriangle } from 'react-icons/fa';
import './Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showAddDiscountModal, setShowAddDiscountModal] = useState(false);
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sample data - replace with actual data from your backend
  const books = [
    { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 15.99, stock: 10, category: "Fiction", status: "In Stock" },
    { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", price: 12.99, stock: 5, category: "Fiction", status: "Low Stock" },
    // Add more sample books...
  ];

  const orders = [
    { id: 1, customer: "John Doe", total: 28.98, status: "Pending", date: "2024-03-10" },
    { id: 2, customer: "Jane Smith", total: 15.99, status: "Completed", date: "2024-03-12" },
    // Add more sample orders...
  ];

  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Staff", status: "Active" },
    // Add more sample users...
  ];

  const discounts = [
    { id: 1, book: "The Great Gatsby", discount: "20%", startDate: "2024-03-15", endDate: "2024-03-30" },
    { id: 2, book: "To Kill a Mockingbird", discount: "15%", startDate: "2024-03-20", endDate: "2024-04-05" },
  ];

  const announcements = [
    { id: 1, title: "Summer Sale", content: "Get 20% off on all fiction books", startDate: "2024-03-15", endDate: "2024-03-30", status: "Active" },
    { id: 2, title: "New Arrivals", content: "New books added to our collection", startDate: "2024-03-14", endDate: "2024-03-28", status: "Active" },
  ];

  // Summary data
  const summaryData = {
    totalSales: 12500.99,
    totalOrders: 156,
    lowStockItems: 8,
    activeUsers: 45
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = books.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(books.length / itemsPerPage);

  return (
    <Container fluid className="admin-dashboard px-0">
      <Card className="admin-sidebar">
        <Card.Body>
          <h4 className="mb-4">Admin Panel</h4>
          <Nav variant="pills" className="flex-column">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')}
              >
                <FaDollarSign className="me-2" />
                Dashboard
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'catalog'} 
                onClick={() => setActiveTab('catalog')}
              >
                <FaBook className="me-2" />
                Manage Catalog
                <span className="notification-badge">2</span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'orders'} 
                onClick={() => setActiveTab('orders')}
              >
                <FaShoppingCart className="me-2" />
                Orders Overview
                <span className="notification-badge">3</span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'users'} 
                onClick={() => setActiveTab('users')}
              >
                <FaUsers className="me-2" />
                User Management
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'discounts'} 
                onClick={() => setActiveTab('discounts')}
              >
                <FaTag className="me-2" />
                Discount Manager
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'announcements'} 
                onClick={() => setActiveTab('announcements')}
              >
                <FaBullhorn className="me-2" />
                Announcements
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'inventory'} 
                onClick={() => setActiveTab('inventory')}
              >
                <FaBox className="me-2" />
                Inventory View
                <span className="notification-badge">5</span>
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Body>
      </Card>

      <div className="admin-content">
        <Tab.Content>
          {/* Dashboard Summary */}
          <Tab.Pane active={activeTab === 'dashboard'}>
            <Row className="g-4 mb-4">
              <Col md={3}>
                <Card className="summary-card">
                  <Card.Body>
                    <h6 className="text-muted mb-2">Total Sales</h6>
                    <h3 className="mb-0">${summaryData.totalSales.toLocaleString()}</h3>
                    <small className="text-success">↑ 12% from last month</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="summary-card">
                  <Card.Body>
                    <h6 className="text-muted mb-2">Total Orders</h6>
                    <h3 className="mb-0">{summaryData.totalOrders}</h3>
                    <small className="text-success">↑ 8% from last month</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="summary-card">
                  <Card.Body>
                    <h6 className="text-muted mb-2">Low Stock Alerts</h6>
                    <h3 className="mb-0">{summaryData.lowStockItems}</h3>
                    <small className="text-danger">Requires attention</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="summary-card">
                  <Card.Body>
                    <h6 className="text-muted mb-2">Active Users</h6>
                    <h3 className="mb-0">{summaryData.activeUsers}</h3>
                    <small className="text-success">↑ 5% from last month</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Card>
                  <Card.Header className="bg-light">
                    <h5 className="mb-0">Recent Orders</h5>
                  </Card.Header>
                  <Card.Body>
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(order => (
                          <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.customer}</td>
                            <td>${order.total}</td>
                            <td>
                              <Badge bg={order.status === 'Completed' ? 'success' : 'warning'}>
                                {order.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card>
                  <Card.Header className="bg-light">
                    <h5 className="mb-0">Low Stock Alerts</h5>
                  </Card.Header>
                  <Card.Body>
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Book</th>
                          <th>Current Stock</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {books.filter(book => book.stock < 10).slice(0, 5).map(book => (
                          <tr key={book.id}>
                            <td>{book.title}</td>
                            <td>{book.stock}</td>
                            <td>
                              <Badge bg="danger">Low Stock</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>

          {/* User Management */}
          <Tab.Pane active={activeTab === 'users'}>
            <Card>
              <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0">User Management</h5>
                <Button variant="primary" onClick={() => setShowAddUserModal(true)}>
                  <FaPlus className="me-2" />
                  Add User
                </Button>
              </Card.Header>
              <Card.Body>
                <div className="mb-3 d-flex gap-3">
                  <Form.Control
                    type="search"
                    placeholder="Search users..."
                    className="w-25"
                  />
                  <Form.Select className="w-25">
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="user">User</option>
                  </Form.Select>
                </div>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          <Badge bg={user.status === 'Active' ? 'success' : 'secondary'}>
                            {user.status}
                          </Badge>
                        </td>
                        <td>
                          <Button variant="outline-primary" size="sm" className="me-2">
                            <FaEdit />
                          </Button>
                          <Button variant="outline-danger" size="sm">
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* Catalog Management */}
          <Tab.Pane active={activeTab === 'catalog'}>
            <Card>
              <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Book Catalog</h5>
                <Button variant="primary" onClick={() => setShowAddBookModal(true)}>
                  <FaPlus className="me-2" />
                  Add New Book
                </Button>
              </Card.Header>
              <Card.Body>
                <div className="mb-3 d-flex gap-3">
                  <Form.Control
                    type="search"
                    placeholder="Search books..."
                    className="w-25"
                  />
                  <Form.Select className="w-25">
                    <option value="">All Categories</option>
                    <option value="fiction">Fiction</option>
                    <option value="non-fiction">Non-Fiction</option>
                    <option value="academic">Academic</option>
                  </Form.Select>
                </div>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map(book => (
                      <tr key={book.id}>
                        <td>{book.id}</td>
                        <td>{book.title}</td>
                        <td>{book.author}</td>
                        <td>${book.price}</td>
                        <td>{book.stock}</td>
                        <td>{book.category}</td>
                        <td>
                          <Badge bg={book.status === 'In Stock' ? 'success' : 'warning'}>
                            {book.status}
                          </Badge>
                        </td>
                        <td>
                          <Button variant="outline-primary" size="sm" className="me-2">
                            <FaEdit />
                          </Button>
                          <Button variant="outline-danger" size="sm">
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* Orders Overview */}
          <Tab.Pane active={activeTab === 'orders'}>
            <Card>
              <Card.Header className="bg-light">
                <h5 className="mb-0">Orders Overview</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3 d-flex gap-3">
                  <Form.Control
                    type="date"
                    className="w-25"
                  />
                  <Form.Select className="w-25">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                  <Button variant="outline-primary">
                    <FaFilter className="me-2" />
                    Apply Filters
                  </Button>
                </div>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.customer}</td>
                        <td>${order.total}</td>
                        <td>
                          <Badge bg={order.status === 'Completed' ? 'success' : 'warning'}>
                            {order.status}
                          </Badge>
                        </td>
                        <td>{order.date}</td>
                        <td>
                          <Button variant="outline-primary" size="sm" className="me-2">
                            View Details
                          </Button>
                          {order.status === 'Pending' && (
                            <Button variant="outline-success" size="sm">
                              Mark Complete
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* Discount Manager */}
          <Tab.Pane active={activeTab === 'discounts'}>
            <Card>
              <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Discount Manager</h5>
                <Button variant="primary" onClick={() => setShowAddDiscountModal(true)}>
                  <FaPlus className="me-2" />
                  Add Discount
                </Button>
              </Card.Header>
              <Card.Body>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Book</th>
                      <th>Discount</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.map(discount => (
                      <tr key={discount.id}>
                        <td>{discount.id}</td>
                        <td>{discount.book}</td>
                        <td>{discount.discount}</td>
                        <td>{discount.startDate}</td>
                        <td>{discount.endDate}</td>
                        <td>
                          <Button variant="outline-primary" size="sm" className="me-2">
                            <FaEdit />
                          </Button>
                          <Button variant="outline-danger" size="sm">
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* Announcements Manager */}
          <Tab.Pane active={activeTab === 'announcements'}>
            <Card>
              <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Announcements</h5>
                <Button variant="primary" onClick={() => setShowAddAnnouncementModal(true)}>
                  <FaPlus className="me-2" />
                  New Announcement
                </Button>
              </Card.Header>
              <Card.Body>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Content</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.map(announcement => (
                      <tr key={announcement.id}>
                        <td>{announcement.id}</td>
                        <td>{announcement.title}</td>
                        <td>{announcement.content}</td>
                        <td>{announcement.startDate}</td>
                        <td>{announcement.endDate}</td>
                        <td>
                          <Badge bg={announcement.status === 'Active' ? 'success' : 'secondary'}>
                            {announcement.status}
                          </Badge>
                        </td>
                        <td>
                          <Button variant="outline-primary" size="sm" className="me-2">
                            <FaEdit />
                          </Button>
                          <Button variant="outline-danger" size="sm">
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* Inventory View */}
          <Tab.Pane active={activeTab === 'inventory'}>
            <Card>
              <Card.Header className="bg-light">
                <h5 className="mb-0">Inventory Overview</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3 d-flex gap-3">
                  <Form.Control
                    type="search"
                    placeholder="Search inventory..."
                    className="w-25"
                  />
                  <Form.Select className="w-25">
                    <option value="">All Categories</option>
                    <option value="fiction">Fiction</option>
                    <option value="non-fiction">Non-Fiction</option>
                    <option value="academic">Academic</option>
                  </Form.Select>
                </div>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Book ID</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>In Stock</th>
                      <th>Reserved</th>
                      <th>Available</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map(book => (
                      <tr key={book.id}>
                        <td>{book.id}</td>
                        <td>{book.title}</td>
                        <td>{book.category}</td>
                        <td>{book.stock}</td>
                        <td>{book.stock - book.reserved}</td>
                        <td>{book.reserved}</td>
                        <td>
                          <Badge bg={book.status === 'In Stock' ? 'success' : 'warning'}>
                            {book.status}
                          </Badge>
                        </td>
                        <td>
                          <Button variant="outline-primary" size="sm" className="me-2">
                            <FaEdit />
                          </Button>
                          <Button variant="outline-danger" size="sm">
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab.Pane>
        </Tab.Content>

        {/* Pagination */}
        {activeTab !== 'dashboard' && (
          <div className="d-flex justify-content-center mt-4">
            <Pagination>
              <Pagination.First onClick={() => setCurrentPage(1)} />
              <Pagination.Prev 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              />
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === currentPage}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last onClick={() => setCurrentPage(totalPages)} />
            </Pagination>
          </div>
        )}
      </div>

      {/* Add Book Modal */}
      <Modal show={showAddBookModal} onHide={() => setShowAddBookModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Book</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" placeholder="Enter book title" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Author</Form.Label>
              <Form.Control type="text" placeholder="Enter author name" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control type="number" placeholder="Enter price" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select>
                <option value="">Select category</option>
                <option value="fiction">Fiction</option>
                <option value="non-fiction">Non-Fiction</option>
                <option value="academic">Academic</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control type="number" placeholder="Enter stock quantity" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddBookModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShowAddBookModal(false)}>
            Add Book
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Discount Modal */}
      <Modal show={showAddDiscountModal} onHide={() => setShowAddDiscountModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Discount</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Book</Form.Label>
              <Form.Select>
                <option value="">Select book</option>
                {books.map(book => (
                  <option key={book.id} value={book.id}>{book.title}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Discount Percentage</Form.Label>
              <Form.Control type="number" placeholder="Enter discount percentage" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control type="date" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control type="date" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddDiscountModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShowAddDiscountModal(false)}>
            Add Discount
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Announcement Modal */}
      <Modal show={showAddAnnouncementModal} onHide={() => setShowAddAnnouncementModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Announcement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" placeholder="Enter announcement title" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Enter announcement content" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control type="date" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control type="date" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddAnnouncementModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShowAddAnnouncementModal(false)}>
            Add Announcement
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add User Modal */}
      <Modal show={showAddUserModal} onHide={() => setShowAddUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" placeholder="Enter user name" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="Enter email address" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select>
                <option value="">Select role</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="user">User</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Enter password" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddUserModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShowAddUserModal(false)}>
            Add User
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Admin; 