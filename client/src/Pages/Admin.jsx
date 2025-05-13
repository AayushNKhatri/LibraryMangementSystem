import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal, Nav, Tab, Badge, Pagination } from 'react-bootstrap';
import { FaBook, FaShoppingCart, FaTag, FaBullhorn, FaBox, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaUsers, FaDollarSign, FaExclamationTriangle } from 'react-icons/fa';
import './Admin.css';
import bookService from '../api/bookService';
import announcementService from '../api/announcementService';
import { BookLanguage, Status, Category, Genre, Format, AnnouncementType } from '../utils/enums';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showAddDiscountModal, setShowAddDiscountModal] = useState(false);
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBookId, setCurrentBookId] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookForm, setBookForm] = useState({
    title: '',
    isbn: '',
    description: '',
    publisher: '',
    language: 0,
    price: 0,
    publicationDate: '',
    status: 0,
    category: 0,
    genre: 0,
    format: 0,
    quantity: 0,
    isOnSale: false,
    discountPercent: 0,
    discountStartDate: '',
    discountEndDate: ''
  });
  const itemsPerPage = 10;

  // Handle announcement functionality
  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    type: 0, // Default to Deal
    startDate: '',
    endDate: ''
  });

  // Fetch books data
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const data = await bookService.getAllBooks();
        setBooks(data);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Fetch announcements data
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await announcementService.getAllAnnouncements();

        // Transform data to match our component state structure
        const transformedData = data.map(item => ({
          id: item.announcementId,
          title: item.announcementDescription.substring(0, 30) + '...',  // Use first part of description as title
          content: item.announcementDescription,
          type: item.announcementType,
          startDate: new Date(item.startDate).toISOString().split('T')[0],
          endDate: new Date(item.endDate).toISOString().split('T')[0],
          status: new Date() > new Date(item.endDate) ? 'Expired' : 'Active'
        }));

        setAnnouncements(transformedData);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
        // Fall back to mock data if API call fails
        const mockAnnouncements = [
          {
            id: 1,
            title: "Summer Sale",
            content: "Get 20% off on all fiction books",
            type: 0, // Deal
            startDate: "2024-05-15",
            endDate: "2024-05-30",
            status: "Active"
          },
          {
            id: 2,
            title: "New Books Added",
            content: "Check out our latest collection of sci-fi novels",
            type: 1, // New Arrival
            startDate: "2024-05-14",
            endDate: "2024-05-28",
            status: "Active"
          }
        ];

        setAnnouncements(mockAnnouncements);
      }
    };

    fetchAnnouncements();
  }, []);

  // Handle book form input change
  const handleBookInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Reset book form
  const resetBookForm = () => {
    setBookForm({
      title: '',
      isbn: '',
      description: '',
      publisher: '',
      language: 0,
      price: 0,
      publicationDate: '',
      status: 0,
      category: 0,
      genre: 0,
      format: 0,
      quantity: 0,
      isOnSale: false,
      discountPercent: 0,
      discountStartDate: '',
      discountEndDate: ''
    });
    setIsEditing(false);
    setCurrentBookId(null);
  };

  // Open book edit modal
  const handleEditBook = (book) => {
    setIsEditing(true);
    setCurrentBookId(book.bookId);

    // Populate form with existing book data
    setBookForm({
      title: book.title,
      isbn: book.isbn,
      description: book.description,
      publisher: book.publisher,
      language: book.language,
      price: book.price,
      publicationDate: book.publicationDate.split('T')[0],
      status: book.status,
      category: book.filters?.[0]?.category || 0,
      genre: book.filters?.[0]?.genre || 0,
      format: book.filters?.[0]?.format || 0,
      quantity: book.inventories?.[0]?.quantity || 0,
      isOnSale: book.inventories?.[0]?.isOnSale || false,
      discountPercent: book.inventories?.[0]?.discountPercent || 0,
      discountStartDate: book.inventories?.[0]?.discoundStartDate?.split('T')[0] || '',
      discountEndDate: book.inventories?.[0]?.discoundEndDate?.split('T')[0] || ''
    });

    setShowAddBookModal(true);
  };

  // Handle book form submission
  const handleSubmitBook = async () => {
    // Validate required fields
    const requiredFields = ['title', 'isbn', 'publisher', 'publicationDate'];
    const missingFields = requiredFields.filter(field => !bookForm[field]);

    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate numeric values
    if (isNaN(parseFloat(bookForm.price)) || parseFloat(bookForm.price) < 0) {
      alert('Please enter a valid price');
      return;
    }

    if (isNaN(parseInt(bookForm.quantity)) || parseInt(bookForm.quantity) < 0) {
      alert('Please enter a valid quantity');
      return;
    }

    if (bookForm.isOnSale) {
      if (isNaN(parseInt(bookForm.discountPercent)) || parseInt(bookForm.discountPercent) <= 0 || parseInt(bookForm.discountPercent) > 100) {
        alert('Please enter a valid discount percentage between 1 and 100');
        return;
      }

      if (!bookForm.discountStartDate || !bookForm.discountEndDate) {
        alert('Please enter discount start and end dates');
        return;
      }

      const startDate = new Date(bookForm.discountStartDate);
      const endDate = new Date(bookForm.discountEndDate);

      if (endDate <= startDate) {
        alert('Discount end date must be after start date');
        return;
      }
    }

    // Create book data object matching the BookDto structure expected by the API
    const bookData = {
      title: bookForm.title,
      isbn: bookForm.isbn,
      description: bookForm.description || '', // Provide default for optional fields
      publisher: bookForm.publisher,
      language: parseInt(bookForm.language),
      publicationDate: new Date(bookForm.publicationDate).toISOString(),
      createdDate: new Date().toISOString(),
      status: parseInt(bookForm.status),
      // These fields will be mapped to BookFilters
      category: parseInt(bookForm.category),
      genre: parseInt(bookForm.genre),
      format: parseInt(bookForm.format),
      // These fields will be mapped to BookInventory
      quantity: parseInt(bookForm.quantity),
      price: parseFloat(bookForm.price),
      isOnSale: bookForm.isOnSale,
      discountPercent: bookForm.isOnSale ? parseInt(bookForm.discountPercent) : 0,
      discoundStartDate: bookForm.isOnSale && bookForm.discountStartDate
        ? new Date(bookForm.discountStartDate).toISOString()
        : new Date().toISOString(),
      discoundEndDate: bookForm.isOnSale && bookForm.discountEndDate
        ? new Date(bookForm.discountEndDate).toISOString()
        : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
    };

    try {
      if (isEditing && currentBookId) {
        // Update existing book
        await bookService.updateBook(currentBookId, bookData);
      } else {
        // Add new book
        await bookService.addBook(bookData);
      }

      // Refresh books list
      const updatedData = await bookService.getAllBooks();
      setBooks(updatedData);
      setShowAddBookModal(false);
      resetBookForm();
    } catch (error) {
      console.error('Error saving book:', error);
      alert(`Failed to save book: ${error.response?.data || error.message}`);
    }
  };

  // Handle book deletion
  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await bookService.deleteBook(bookId);
        // Refresh books list
        const updatedData = await bookService.getAllBooks();
        setBooks(updatedData);
      } catch (error) {
        console.error('Error deleting book:', error);
        alert('Failed to delete book. Please try again.');
      }
    }
  };

  // Handle announcement form input change
  const handleAnnouncementInputChange = (e) => {
    const { name, value } = e.target;
    setAnnouncementForm(prev => ({
      ...prev,
      [name]: name === 'type' ? parseInt(value) : value
    }));
  };

  // Reset announcement form
  const resetAnnouncementForm = () => {
    setAnnouncementForm({
      title: '',
      content: '',
      type: 0,
      startDate: '',
      endDate: ''
    });
    setIsEditing(false);
    setCurrentAnnouncementId(null);
  };

  // Handle edit announcement
  const [currentAnnouncementId, setCurrentAnnouncementId] = useState(null);

  const handleEditAnnouncement = (announcement) => {
    setIsEditing(true);
    setCurrentAnnouncementId(announcement.id);

    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      startDate: announcement.startDate,
      endDate: announcement.endDate
    });

    setShowAddAnnouncementModal(true);
  };

  // Handle announcement form submission
  const handleSubmitAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.content || !announcementForm.startDate || !announcementForm.endDate) {
      alert('All fields are required');
      return;
    }

    try {
      const announcementData = {
        type: announcementForm.type,
        content: announcementForm.content,
        startDate: announcementForm.startDate,
        endDate: announcementForm.endDate
      };

      if (isEditing && currentAnnouncementId) {
        // Update existing announcement
        await announcementService.updateAnnouncement(currentAnnouncementId, announcementData);
      } else {
        // Create new announcement
        await announcementService.createAnnouncement(announcementData);
      }

      // Refresh announcements list
      const data = await announcementService.getAllAnnouncements();

      // Transform data to match our component state structure
      const transformedData = data.map(item => ({
        id: item.announcementId,
        title: item.announcementDescription.substring(0, 30) + '...',
        content: item.announcementDescription,
        type: item.announcementType,
        startDate: new Date(item.startDate).toISOString().split('T')[0],
        endDate: new Date(item.endDate).toISOString().split('T')[0],
        status: new Date() > new Date(item.endDate) ? 'Expired' : 'Active'
      }));

      setAnnouncements(transformedData);
      setShowAddAnnouncementModal(false);
      resetAnnouncementForm();
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Failed to save announcement. Please try again.');
    }
  };

  // Handle announcement deletion
  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        // Note: API might not support deletion, so handle accordingly
        await announcementService.deleteAnnouncement(id);

        // Refresh announcements list
        const data = await announcementService.getAllAnnouncements();

        // Transform data to match our component state structure
        const transformedData = data.map(item => ({
          id: item.announcementId,
          title: item.announcementDescription.substring(0, 30) + '...',
          content: item.announcementDescription,
          type: item.announcementType,
          startDate: new Date(item.startDate).toISOString().split('T')[0],
          endDate: new Date(item.endDate).toISOString().split('T')[0],
          status: new Date() > new Date(item.endDate) ? 'Expired' : 'Active'
        }));

        setAnnouncements(transformedData);
      } catch (error) {
        console.error('Error deleting announcement:', error);
        alert('Failed to delete announcement. The API may not support deletion.');

        // If the API doesn't support deletion, just update the UI
        setAnnouncements(announcements.filter(announcement => announcement.id !== id));
      }
    }
  };

  // Sample data - replace with actual data from your backend
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

  // Calculate notification badges
  const catalogNotifications = useMemo(() => {
    // Count books with low stock (less than 5 items)
    const lowStockBooks = books.filter(book => {
      const quantity = book.inventories?.[0]?.quantity || 0;
      return quantity < 5 && quantity > 0;
    }).length;

    // Count out of stock books
    const outOfStockBooks = books.filter(book => {
      const quantity = book.inventories?.[0]?.quantity || 0;
      return quantity === 0;
    }).length;

    return lowStockBooks + outOfStockBooks;
  }, [books]);

  const orderNotifications = useMemo(() => {
    // Count pending orders
    return orders.filter(order => order.status === 'Pending').length;
  }, [orders]);

  const inventoryNotifications = useMemo(() => {
    // Count books with low stock for inventory tab
    return books.filter(book => {
      const quantity = book.inventories?.[0]?.quantity || 0;
      return quantity < 5;
    }).length;
  }, [books]);

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
                {catalogNotifications > 0 && (
                  <span className="notification-badge">{catalogNotifications}</span>
                )}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'orders'}
                onClick={() => setActiveTab('orders')}
              >
                <FaShoppingCart className="me-2" />
                Orders Overview
                {orderNotifications > 0 && (
                  <span className="notification-badge">{orderNotifications}</span>
                )}
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
                {inventoryNotifications > 0 && (
                  <span className="notification-badge">{inventoryNotifications}</span>
                )}
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
                <Button variant="primary" onClick={() => {
                  resetBookForm();
                  setShowAddBookModal(true);
                }}>
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
                    {Object.entries(Category).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </Form.Select>
                </div>

                {loading ? (
                  <div className="text-center py-4">
                    <p>Loading books...</p>
                  </div>
                ) : books.length === 0 ? (
                  <div className="text-center py-4">
                    <p>No books found. Add some books to get started!</p>
                  </div>
                ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                        <th>Publisher</th>
                      <th>Price</th>
                      <th>Category</th>
                        <th>Genre</th>
                        <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map(book => (
                        <tr key={book.bookId}>
                          <td>{book.bookId.substring(0, 8)}...</td>
                        <td>{book.title}</td>
                          <td>{book.publisher}</td>
                        <td>${book.price}</td>
                          <td>{book.filters?.[0] ? Category[book.filters[0].category] : 'N/A'}</td>
                          <td>{book.filters?.[0] ? Genre[book.filters[0].genre] : 'N/A'}</td>
                          <td>{book.inventories?.[0]?.quantity || 0}</td>
                        <td>
                            <Badge bg={book.status === 0 ? 'success' : 'warning'}>
                              {Status[book.status]}
                          </Badge>
                        </td>
                        <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEditBook(book)}
                            >
                            <FaEdit />
                          </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteBook(book.bookId)}
                            >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                )}
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
                <Button variant="primary" onClick={() => {
                  resetAnnouncementForm();
                  setShowAddAnnouncementModal(true);
                }}>
                  <FaPlus className="me-2" />
                  New Announcement
                </Button>
              </Card.Header>
              <Card.Body>
                {announcements.length === 0 ? (
                  <div className="text-center py-4">
                    <p>No announcements found. Create some announcements to get started!</p>
                  </div>
                ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                        <th>Type</th>
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
                          <td>
                            <Badge bg="info">
                              {AnnouncementType[announcement.type]}
                            </Badge>
                          </td>
                          <td>
                            {announcement.content.length > 50
                              ? `${announcement.content.substring(0, 50)}...`
                              : announcement.content}
                          </td>
                        <td>{announcement.startDate}</td>
                        <td>{announcement.endDate}</td>
                        <td>
                          <Badge bg={announcement.status === 'Active' ? 'success' : 'secondary'}>
                            {announcement.status}
                          </Badge>
                        </td>
                        <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEditAnnouncement(announcement)}
                            >
                            <FaEdit />
                          </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteAnnouncement(announcement.id)}
                            >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                )}
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
      <Modal show={showAddBookModal} onHide={() => setShowAddBookModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Book' : 'Add New Book'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <h5 className="mb-3">Book Details</h5>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={bookForm.title}
                    onChange={handleBookInputChange}
                    placeholder="Enter book title"
                  />
            </Form.Group>
            <Form.Group className="mb-3">
                  <Form.Label>ISBN</Form.Label>
                  <Form.Control
                    type="text"
                    name="isbn"
                    value={bookForm.isbn}
                    onChange={handleBookInputChange}
                    placeholder="Enter ISBN"
                  />
            </Form.Group>
            <Form.Group className="mb-3">
                  <Form.Label>Publisher</Form.Label>
                  <Form.Control
                    type="text"
                    name="publisher"
                    value={bookForm.publisher}
                    onChange={handleBookInputChange}
                    placeholder="Enter publisher"
                  />
            </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Language</Form.Label>
                  <Form.Select
                    name="language"
                    value={bookForm.language}
                    onChange={handleBookInputChange}
                  >
                    {Object.entries(BookLanguage).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Publication Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="publicationDate"
                    value={bookForm.publicationDate}
                    onChange={handleBookInputChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={bookForm.description}
                    onChange={handleBookInputChange}
                    placeholder="Enter book description"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <h5 className="mb-3">Categories & Inventory</h5>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={bookForm.category}
                    onChange={handleBookInputChange}
                  >
                    {Object.entries(Category).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
                  <Form.Label>Genre</Form.Label>
                  <Form.Select
                    name="genre"
                    value={bookForm.genre}
                    onChange={handleBookInputChange}
                  >
                    {Object.entries(Genre).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </Form.Select>
            </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Format</Form.Label>
                  <Form.Select
                    name="format"
                    value={bookForm.format}
                    onChange={handleBookInputChange}
                  >
                    {Object.entries(Format).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={bookForm.status}
                    onChange={handleBookInputChange}
                  >
                    {Object.entries(Status).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={bookForm.price}
                    onChange={handleBookInputChange}
                    placeholder="Enter price"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={bookForm.quantity}
                    onChange={handleBookInputChange}
                    placeholder="Enter quantity"
                  />
                </Form.Group>
                <hr />
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="On Sale"
                    name="isOnSale"
                    checked={bookForm.isOnSale}
                    onChange={handleBookInputChange}
                  />
                </Form.Group>
                {bookForm.isOnSale && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Discount (%)</Form.Label>
                      <Form.Control
                        type="number"
                        name="discountPercent"
                        value={bookForm.discountPercent}
                        onChange={handleBookInputChange}
                        placeholder="Enter discount percentage"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Discount Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="discountStartDate"
                        value={bookForm.discountStartDate}
                        onChange={handleBookInputChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Discount End Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="discountEndDate"
                        value={bookForm.discountEndDate}
                        onChange={handleBookInputChange}
                      />
                    </Form.Group>
                  </>
                )}
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddBookModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitBook}>
            {isEditing ? 'Update Book' : 'Add Book'}
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
          <Modal.Title>{isEditing ? 'Edit Announcement' : 'Add New Announcement'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={announcementForm.title}
                onChange={handleAnnouncementInputChange}
                placeholder="Enter announcement title"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="type"
                value={announcementForm.type}
                onChange={handleAnnouncementInputChange}
              >
                {Object.entries(AnnouncementType).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="content"
                value={announcementForm.content}
                onChange={handleAnnouncementInputChange}
                placeholder="Enter announcement content"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                name="startDate"
                value={announcementForm.startDate}
                onChange={handleAnnouncementInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                name="endDate"
                value={announcementForm.endDate}
                onChange={handleAnnouncementInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddAnnouncementModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitAnnouncement}>
            {isEditing ? 'Update Announcement' : 'Add Announcement'}
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
