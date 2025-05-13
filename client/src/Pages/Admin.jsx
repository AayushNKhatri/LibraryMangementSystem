import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal, Nav, Tab, Badge, Pagination, Alert } from 'react-bootstrap';
import { FaBook, FaShoppingCart, FaTag, FaBullhorn, FaBox, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaUsers, FaDollarSign, FaExclamationTriangle, FaCheck, FaTimes } from 'react-icons/fa';
import './Admin.css';
import bookService from '../api/bookService';
import announcementService, { AnnouncementType } from '../api/announcementService';
import orderService from '../api/OrderServer';
import { BookLanguage, Status, Category, Genre, Format } from '../utils/enums';

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
    discountEndDate: '',
    authorName1: '',
    authorName2: '',
    authorName3: ''
  });
  const [bookImage, setBookImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const itemsPerPage = 10;

  // Handle announcement functionality
  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    type: 0, // Default to Deal
    endDate: ''
  });

  // Handle order functionality
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [claimCode, setClaimCode] = useState('');
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState({ show: false, text: '', type: '' });

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
            endDate: "2024-05-30",
            status: "Active"
          },
          {
            id: 2,
            title: "New Books Added",
            content: "Check out our latest collection of sci-fi novels",
            type: 1, // New Arrival
            endDate: "2024-05-28",
            status: "Active"
          }
        ];

        setAnnouncements(mockAnnouncements);
      }
    };

    fetchAnnouncements();
  }, []);

  // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getAllOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        // Fall back to sample data if API call fails
        setOrders([
          { id: 1, customer: "John Doe", total: 28.98, status: "Pending", date: "2024-03-10" },
          { id: 2, customer: "Jane Smith", total: 15.99, status: "Completed", date: "2024-03-12" },
        ]);
      }
    };

    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

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
      discountEndDate: '',
      authorName1: '',
      authorName2: '',
      authorName3: ''
    });
    setBookImage(null);
    setImagePreview('');
    setIsEditing(false);
    setCurrentBookId(null);
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBookImage(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
      discountEndDate: book.inventories?.[0]?.discoundEndDate?.split('T')[0] || '',
      authorName1: book.authorNamePrimary || '',
      authorName2: book.authorNameSecondary || '',
      authorName3: book.additionalAuthorName || ''
    });

    // Reset image preview
    setBookImage(null);
    setImagePreview('');
    
    setShowAddBookModal(true);
  };

  // Handle book form submission
  const handleSubmitBook = async () => {
    // Validate required fields
    const requiredFields = ['title', 'isbn', 'publisher', 'publicationDate', 'authorName1'];
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
      // Author fields
      authorName1: bookForm.authorName1,
      authorName2: bookForm.authorName2 || '',
      authorName3: bookForm.authorName3 || '',
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
        
        // Upload image if provided
        if (bookImage) {
          const formData = new FormData();
          formData.append('image', bookImage);
          await bookService.updateBookImage(currentBookId, formData);
        }
      } else {
        // Add new book
        const result = await bookService.addBook(bookData);
        
        // Upload image if provided and book was created successfully
        if (bookImage && result) {
          const bookId = result.bookId || currentBookId;
          const formData = new FormData();
          formData.append('image', bookImage);
          await bookService.addBookImage(bookId, formData);
        }
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
      endDate: announcement.endDate
    });

    setShowAddAnnouncementModal(true);
  };

  // Handle announcement form submission
  const handleSubmitAnnouncement = async () => {
    if (!announcementForm.content || !announcementForm.endDate) {
      alert('Content and end date are required');
      return;
    }

    try {
      const announcementData = {
        type: announcementForm.type,
        content: announcementForm.content,
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
        alert('Failed to delete announcement. Please try again.');
      }
    }
  };

  // View order details
  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setClaimCode('');
    setOrderMessage({ show: false, text: '', type: '' });
    setShowOrderDetailsModal(true);
  };

  // Handle claim code input change
  const handleClaimCodeChange = (e) => {
    setClaimCode(e.target.value);
  };

  // Mark order as complete
  const handleCompleteOrder = async () => {
    if (!selectedOrder || !claimCode) {
      setOrderMessage({ 
        show: true, 
        text: 'Please enter the claim code to complete this order.', 
        type: 'warning' 
      });
      return;
    }

    try {
      setProcessingOrder(true);
      const result = await orderService.completeOrder(selectedOrder.orderId, claimCode);
      
      if (result) {
        setOrderMessage({ 
          show: true, 
          text: 'Order has been successfully marked as complete!', 
          type: 'success' 
        });
        
        // Refresh orders list
        const updatedOrders = await orderService.getAllOrders();
        setOrders(updatedOrders);
        
        // Close modal after a delay
        setTimeout(() => {
          setShowOrderDetailsModal(false);
        }, 2000);
      } else {
        setOrderMessage({ 
          show: true, 
          text: 'Failed to complete order. Invalid claim code or order status.', 
          type: 'danger' 
        });
      }
    } catch (error) {
      console.error('Error completing order:', error);
      setOrderMessage({ 
        show: true, 
        text: 'An error occurred while completing the order.', 
        type: 'danger' 
      });
    } finally {
      setProcessingOrder(false);
    }
  };

  // Cancel order
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessingOrder(true);
      const result = await orderService.cancelOrder(selectedOrder.orderId);
      
      if (result) {
        setOrderMessage({ 
          show: true, 
          text: 'Order has been successfully cancelled!', 
          type: 'success' 
        });
        
        // Refresh orders list
        const updatedOrders = await orderService.getAllOrders();
        setOrders(updatedOrders);
        
        // Close modal after a delay
        setTimeout(() => {
          setShowOrderDetailsModal(false);
        }, 2000);
      } else {
        setOrderMessage({ 
          show: true, 
          text: 'Failed to cancel order.', 
          type: 'danger' 
        });
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      setOrderMessage({ 
        show: true, 
        text: 'An error occurred while cancelling the order.', 
        type: 'danger' 
      });
    } finally {
      setProcessingOrder(false);
    }
  };

  // Sample data - replace with actual data from your backend
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
                      <tr key={order.orderId || order.id}>
                        <td>{order.orderId ? order.orderId.substring(0, 8) : order.id}</td>
                        <td>{order.userName || order.customer}</td>
                        <td>${order.totalAmount?.toFixed(2) || order.total}</td>
                        <td>
                          <Badge bg={
                            order.orderStatus === 0 || order.status === 'Pending' 
                              ? 'warning' 
                              : order.orderStatus === 1 || order.status === 'Completed' 
                                ? 'success' 
                                : 'danger'
                          }>
                            {order.orderStatus === 0 || order.status === 'Pending' 
                              ? 'Pending' 
                              : order.orderStatus === 1 || order.status === 'Completed' 
                                ? 'Completed' 
                                : 'Cancelled'}
                          </Badge>
                        </td>
                        <td>{order.orderDate 
                            ? new Date(order.orderDate).toLocaleDateString() 
                            : order.date}
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleViewOrderDetails(order)}
                          >
                            View Details
                          </Button>
                          {(order.orderStatus === 0 || order.status === 'Pending') && (
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => handleViewOrderDetails(order)}
                            >
                              <FaCheck className="me-1" /> Complete
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
                      <th>Content</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.map(announcement => (
                      <tr key={announcement.id}>
                        <td>
                          {announcement.content.length > 50
                            ? `${announcement.content.substring(0, 50)}...`
                            : announcement.content}
                        </td>
                        <td>{announcement.startDate}</td>
                        <td>{announcement.endDate}</td>
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
                
                <h5 className="mb-3 mt-4">Authors</h5>
                <Form.Group className="mb-3">
                  <Form.Label>Primary Author *</Form.Label>
                  <Form.Control
                    type="text"
                    name="authorName1"
                    value={bookForm.authorName1}
                    onChange={handleBookInputChange}
                    placeholder="Enter primary author name"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Secondary Author (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="authorName2"
                    value={bookForm.authorName2}
                    onChange={handleBookInputChange}
                    placeholder="Enter secondary author name"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Additional Author (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="authorName3"
                    value={bookForm.authorName3}
                    onChange={handleBookInputChange}
                    placeholder="Enter additional author name"
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
                
                <Form.Group className="mb-4">
                  <Form.Label>Book Cover Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <Form.Text className="text-muted">
                    Upload a cover image for the book (JPG, PNG)
                  </Form.Text>
                  
                  {imagePreview && (
                    <div className="mt-2 text-center">
                      <img 
                        src={imagePreview} 
                        alt="Cover preview" 
                        style={{ maxHeight: '150px', maxWidth: '100%', objectFit: 'contain' }} 
                        className="border rounded"
                      />
                    </div>
                  )}
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
                <option value={AnnouncementType.Deal}>Deal</option>
                <option value={AnnouncementType.New_Arrival}>New Arrival</option>
                <option value={AnnouncementType.Information}>Information</option>
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

      {/* Order Details Modal */}
      <Modal 
        show={showOrderDetailsModal} 
        onHide={() => setShowOrderDetailsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>Order Information</h5>
                  <p><strong>Order ID:</strong> {selectedOrder.orderId 
                    ? selectedOrder.orderId.substring(0, 8) 
                    : selectedOrder.id}</p>
                  <p><strong>Date:</strong> {selectedOrder.orderDate 
                    ? new Date(selectedOrder.orderDate).toLocaleDateString() 
                    : selectedOrder.date}</p>
                  <p><strong>Customer:</strong> {selectedOrder.userName || selectedOrder.customer}</p>
                  <p><strong>Total Amount:</strong> ${selectedOrder.totalAmount?.toFixed(2) || selectedOrder.total}</p>
                  <p><strong>Status:</strong> 
                    <Badge 
                      className="ms-2"
                      bg={
                        selectedOrder.orderStatus === 0 || selectedOrder.status === 'Pending' 
                          ? 'warning' 
                          : selectedOrder.orderStatus === 1 || selectedOrder.status === 'Completed' 
                            ? 'success' 
                            : 'danger'
                      }
                    >
                      {selectedOrder.orderStatus === 0 || selectedOrder.status === 'Pending' 
                        ? 'Pending' 
                        : selectedOrder.orderStatus === 1 || selectedOrder.status === 'Completed' 
                          ? 'Completed' 
                          : 'Cancelled'}
                    </Badge>
                  </p>
                </Col>
                <Col md={6}>
                  <h5>Books</h5>
                  <ul className="list-group">
                    {selectedOrder.books ? (
                      selectedOrder.books.map((book, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          <span>{book.title || 'Book'}</span>
                          <span>Qty: {book.quantity || 1}</span>
                        </li>
                      ))
                    ) : (
                      <li className="list-group-item">No detailed book information available</li>
                    )}
                  </ul>
                </Col>
              </Row>

              {orderMessage.show && (
                <Alert variant={orderMessage.type} className="mb-3">
                  {orderMessage.text}
                </Alert>
              )}

              {(selectedOrder.orderStatus === 0 || selectedOrder.status === 'Pending') && (
                <Row className="mb-3">
                  <Col>
                    <Form.Group>
                      <Form.Label>Enter Claim Code to Complete Order</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="Enter claim code"
                        value={claimCode}
                        onChange={handleClaimCodeChange}
                      />
                      <Form.Text className="text-muted">
                        Verify the claim code provided by the customer before completing the order.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowOrderDetailsModal(false)}
          >
            Close
          </Button>
          
          {(selectedOrder?.orderStatus === 0 || selectedOrder?.status === 'Pending') && (
            <>
              <Button 
                variant="danger" 
                onClick={handleCancelOrder}
                disabled={processingOrder}
              >
                {processingOrder ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : (
                  <FaTimes className="me-2" />
                )}
                Cancel Order
              </Button>
              <Button 
                variant="success" 
                onClick={handleCompleteOrder}
                disabled={processingOrder || !claimCode}
              >
                {processingOrder ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : (
                  <FaCheck className="me-2" />
                )}
                Complete Order
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Admin;
