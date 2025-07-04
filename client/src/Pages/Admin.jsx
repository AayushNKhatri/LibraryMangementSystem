import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal, Nav, Tab, Badge, Pagination, Alert } from 'react-bootstrap';
import { FaBook, FaShoppingCart, FaTag, FaBullhorn, FaBox, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaUsers, FaDollarSign, FaCheck, FaTimes, FaBell, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Admin.css';
import bookService from '../api/bookService';
import announcementService, { AnnouncementType } from '../api/announcementService';
import orderService from '../api/OrderServer';
import dashboardService from '../api/dashboardService';
import notificationService from '../api/notificationService';
import authService from '../api/authService';
import { BookLanguage, Status, Category, Genre, Format } from '../utils/enums';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Handle logout
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBookId, setCurrentBookId] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Catalog filters
  const [catalogFilters, setCatalogFilters] = useState({
    search: '',
    category: '',
    genre: '',
    status: '',
    priceRange: { min: '', max: '' },
    stockStatus: ''
  });

  // Order filters
  const [orderFilters, setOrderFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: '',
    search: '',
    minAmount: '',
    maxAmount: ''
  });

  // Filtered books based on catalog filters
  const filteredBooks = useMemo(() => {
    if (!books || books.length === 0) return [];

    return books.filter(book => {
      // Search filter (title, author, ISBN, publisher)
      if (catalogFilters.search && catalogFilters.search.trim() !== '') {
        const searchTerm = catalogFilters.search.toLowerCase();
        const titleMatch = book.title?.toLowerCase().includes(searchTerm);
        const publisherMatch = book.publisher?.toLowerCase().includes(searchTerm);
        const authorMatch = [
          book.authorNamePrimary,
          book.authorNameSecondary,
          book.additionalAuthorName
        ].some(author => author?.toLowerCase().includes(searchTerm));
        const isbnMatch = book.isbn?.toLowerCase().includes(searchTerm);

        if (!(titleMatch || publisherMatch || authorMatch || isbnMatch)) {
          return false;
        }
      }

      // Category filter
      if (catalogFilters.category && catalogFilters.category !== '') {
        const categoryValue = parseInt(catalogFilters.category);
        if (book.filters?.[0]?.category !== categoryValue) {
          return false;
        }
      }

      // Genre filter
      if (catalogFilters.genre && catalogFilters.genre !== '') {
        const genreValue = parseInt(catalogFilters.genre);
        if (book.filters?.[0]?.genre !== genreValue) {
          return false;
        }
      }

      // Status filter
      if (catalogFilters.status && catalogFilters.status !== '') {
        const statusValue = parseInt(catalogFilters.status);
        if (book.status !== statusValue) {
          return false;
        }
      }

      // Price range filter
      if (catalogFilters.priceRange.min && !isNaN(catalogFilters.priceRange.min)) {
        const minPrice = parseFloat(catalogFilters.priceRange.min);
        if (book.inventories?.[0]?.price < minPrice) {
          return false;
        }
      }

      if (catalogFilters.priceRange.max && !isNaN(catalogFilters.priceRange.max)) {
        const maxPrice = parseFloat(catalogFilters.priceRange.max);
        if (book.inventories?.[0]?.price > maxPrice) {
          return false;
        }
      }

      // Stock status filter
      if (catalogFilters.stockStatus && catalogFilters.stockStatus !== '') {
        const quantity = book.inventories?.[0]?.quantity || 0;

        if (catalogFilters.stockStatus === 'inStock' && quantity <= 0) {
          return false;
        }

        if (catalogFilters.stockStatus === 'lowStock' && (quantity > 3 || quantity <= 0)) {
          return false;
        }

        if (catalogFilters.stockStatus === 'outOfStock' && quantity > 0) {
          return false;
        }
      }

      return true;
    });
  }, [books, catalogFilters]);

  // Removed filteredOrders useMemo hook from here to place it after orders state declaration
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

  // Filtered orders based on order filters
  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    return orders.filter(order => {
      // Search filter (order ID, customer name)
      if (orderFilters.search && orderFilters.search.trim() !== '') {
        const searchTerm = orderFilters.search.toLowerCase();
        const orderIdMatch = order.orderId?.toLowerCase().includes(searchTerm) ||
                            order.id?.toString().toLowerCase().includes(searchTerm);
        const customerMatch = order.userName?.toLowerCase().includes(searchTerm) ||
                             order.customer?.toLowerCase().includes(searchTerm);

        if (!(orderIdMatch || customerMatch)) {
          return false;
        }
      }

      // Date range filter - from
      if (orderFilters.dateFrom && orderFilters.dateFrom.trim() !== '') {
        const fromDate = new Date(orderFilters.dateFrom);
        const orderDate = new Date(order.orderDate || order.date);

        if (orderDate < fromDate) {
          return false;
        }
      }

      // Date range filter - to
      if (orderFilters.dateTo && orderFilters.dateTo.trim() !== '') {
        const toDate = new Date(orderFilters.dateTo);
        toDate.setHours(23, 59, 59); // End of the day
        const orderDate = new Date(order.orderDate || order.date);

        if (orderDate > toDate) {
          return false;
        }
      }

      // Status filter
      if (orderFilters.status && orderFilters.status !== '') {
        const statusValue = parseInt(orderFilters.status);
        const orderStatus = order.orderStatus !== undefined ? order.orderStatus :
                           (order.status === 'Pending' ? 0 :
                            order.status === 'Completed' ? 1 : 2);

        if (orderStatus !== statusValue) {
          return false;
        }
      }

      // Amount range filter - min
      if (orderFilters.minAmount && !isNaN(orderFilters.minAmount)) {
        const minAmount = parseFloat(orderFilters.minAmount);
        const orderAmount = order.totalAmount || order.total || 0;

        if (orderAmount < minAmount) {
          return false;
        }
      }

      // Amount range filter - max
      if (orderFilters.maxAmount && !isNaN(orderFilters.maxAmount)) {
        const maxAmount = parseFloat(orderFilters.maxAmount);
        const orderAmount = order.totalAmount || order.total || 0;

        if (orderAmount > maxAmount) {
          return false;
        }
      }

      return true;
    });
  }, [orders, orderFilters]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [claimCode, setClaimCode] = useState('');
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState({ show: false, text: '', type: '' });

  // Handle notification functionality
  const [notifications, setNotifications] = useState([]);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    userId: '',
    isGlobal: false
  });
  const [loadingNotifications, setLoadingNotifications] = useState(false);

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

      }
    };

    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  // Fetch notifications data
  useEffect(() => {
    const fetchNotifications = async () => {
      if (activeTab === 'notifications') {
        setLoadingNotifications(true);
        try {
          const data = await notificationService.getNotifications();
          setNotifications(data);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        } finally {
          setLoadingNotifications(false);
        }
      }
    };

    fetchNotifications();
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
        console.log('Book add response:', result); // Log the response for debugging

        // Upload image if provided and book was created successfully
        if (bookImage && result) {
          try {
            // Extract book ID from response - check for all possible property names
            let bookId = null;
            
            // Try to find the book ID in the response using different possible property names
            if (result.bookId) bookId = result.bookId;
            else if (result.BookId) bookId = result.BookId;
            else if (result.bookID) bookId = result.bookID;
            else if (result.BookID) bookId = result.BookID;
            else if (result.id) bookId = result.id;
            else if (result.Id) bookId = result.Id;
            
            // If we still don't have a book ID, try to fetch the newly created book by ISBN
            if (!bookId) {
              console.log('Book ID not found in response, attempting to fetch by ISBN');
              // Fetch all books and find the one with matching ISBN
              const allBooks = await bookService.getAllBooks();
              const newBook = allBooks.find(book => book.isbn === bookForm.isbn);
              
              if (newBook && newBook.bookId) {
                bookId = newBook.bookId;
                console.log('Found book ID by ISBN lookup:', bookId);
              } else {
                throw new Error('Could not find the newly created book by ISBN');
              }
            }

            if (!bookId) {
              throw new Error('Could not determine book ID from response or lookup');
            }

            console.log('Using book ID for image upload:', bookId);
            const formData = new FormData();
            formData.append('image', bookImage);
            await bookService.addBookImage(bookId, formData);
          } catch (imageError) {
            console.error('Error uploading book image:', imageError);
            alert(`Book was created successfully, but image upload failed: ${imageError.message}`);
          }
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
        title: item.announcementDescription.substring(0, 30) + '...',  // Use first part of description as title
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
          title: item.announcementDescription.substring(0, 30) + '...',  // Use first part of description as title
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

  // Dashboard summary data state
  const [summaryData, setSummaryData] = useState({
    totalSales: 0,
    totalOrders: 0,
    lowStockItems: 0,
    activeUsers: 0,
    recentOrders: [],
    lowStockBooks: []
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (activeTab === 'dashboard') {
        try {
          const data = await dashboardService.getDashboardSummary();
          setSummaryData(data);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        }
      }
    };

    fetchDashboardData();
  }, [activeTab]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = books.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(books.length / itemsPerPage);

  // Calculate notification badges
  const catalogNotifications = useMemo(() => {
    // Count books with low stock (less than 3 items)
    const lowStockBooks = books.filter(book => {
      const quantity = book.inventories?.[0]?.quantity || 0;
      return quantity <= 3 && quantity > 0;
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

  // Handle marking notification as read
  const handleMarkAsRead = async (notificationId) => {
    // Validate notification ID
    if (!notificationId) {
      console.error('Invalid notification ID:', notificationId);
      alert('Cannot mark as read: Invalid notification ID');
      return;
    }
    
    try {
      // Show loading state
      setLoadingNotifications(true);
      
      console.log(`Marking notification ${notificationId} as read`);
      
      // Call the API to mark notification as read
      await notificationService.markAsRead(notificationId);
      
      // Find the notification in the current state to determine its structure
      const targetNotification = notifications.find(n => 
        (n.notificationId === notificationId) || (n.id === notificationId)
      );
      
      if (targetNotification) {
        console.log('Found notification to update:', targetNotification);
        
        // Update the local state to reflect the change
        // This handles both notificationId and id property names
        setNotifications(prevNotifications => prevNotifications.map(notification => {
          if ((notification.notificationId === notificationId) || 
              (notification.id === notificationId)) {
            // Create a new object with isRead set to true
            return {
              ...notification,
              isRead: true
            };
          }
          return notification;
        }));
        
        console.log(`Successfully marked notification ${notificationId} as read`);
      } else {
        console.warn(`Notification with ID ${notificationId} not found in state`);
        // Refresh the notifications list from the server
        const updatedNotifications = await notificationService.getNotifications();
        setNotifications(updatedNotifications);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
    } finally {
      // Reset loading state
      setLoadingNotifications(false);
    }
  };
  
  // Handle deleting a notification
  const handleDeleteNotification = async (notificationId) => {
    // Validate notification ID
    if (!notificationId) {
      console.error('Invalid notification ID for deletion:', notificationId);
      alert('Cannot delete: Invalid notification ID');
      return;
    }
    
    // Confirm deletion with user
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }
    
    try {
      // Show loading state
      setLoadingNotifications(true);
      
      console.log(`Deleting notification ${notificationId}`);
      
      // Call the API to delete the notification
      await notificationService.deleteNotification(notificationId);
      
      // Update the local state by removing the deleted notification
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => 
          notification.notificationId !== notificationId && notification.id !== notificationId
        )
      );
      
      console.log(`Successfully deleted notification ${notificationId}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
      alert(`Failed to delete notification: ${error.message}`);
    } finally {
      // Reset loading state
      setLoadingNotifications(false);
    }
  };

  // Handle sending a new notification
  const handleSendNotification = async () => {
    // This is a placeholder - you'll need to add the sendNotification method to your notificationService
    console.log('Sending notification:', notificationForm);
    // Close the modal
    setShowNotificationModal(false);
    // Reset the form
    setNotificationForm({
      title: '',
      message: '',
      userId: '',
      isGlobal: false
    });
    // Refresh notifications list
    if (activeTab === 'notifications') {
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }
  };

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
                active={activeTab === 'announcements'}
                onClick={() => setActiveTab('announcements')}
              >
                <FaBullhorn className="me-2" />
                Announcements
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'notifications'}
                onClick={() => setActiveTab('notifications')}
              >
                <FaBell className="me-2" />
                Notifications
              </Nav.Link>
            </Nav.Item>

            <div className="mt-auto pt-4 border-top mt-4">
              <Nav.Item>
                <Nav.Link
                  className="text-danger"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="me-2" />
                  Logout
                </Nav.Link>
              </Nav.Item>
            </div>
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
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="summary-card">
                  <Card.Body>
                    <h6 className="text-muted mb-2">Total Orders</h6>
                    <h3 className="mb-0">{summaryData.totalOrders}</h3>
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
                    <h6 className="text-muted mb-2">Verified Users</h6>
                    <h3 className="mb-0">{summaryData.verifiedUsers}</h3>
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
                        {summaryData.recentOrders.map(order => (
                          <tr key={order.id}>
                            <td>{order.id ? order.id.substring(0, 8) : 'N/A'}</td>
                            <td>
                              {order.user ? (
                                <>
                                  {order.user.firstName} {order.user.lastName}
                                  <br />
                                  <small className="text-muted">{order.user.email}</small>
                                </>
                              ) : (
                                order.customer || 'Unknown'
                              )}
                            </td>
                            <td>${order.total.toFixed(2)}</td>
                            <td>
                              <Badge bg={
                                order.orderStatus === 1 ? 'success' : 
                                order.orderStatus === 0 ? 'warning' : 'danger'
                              }>
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
                        {summaryData.lowStockBooks.map(book => (
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
                <Card className="filter-card mb-3">
                  <Card.Body>
                    <h6 className="mb-3"><FaFilter className="me-2" /> Filter Books</h6>
                    <Row className="g-2">
                      <Col md={4}>
                        <Form.Group className="mb-2">
                          <Form.Label>Search</Form.Label>
                          <Form.Control
                            type="search"
                            placeholder="Search by title, author, ISBN..."
                            value={catalogFilters.search}
                            onChange={(e) => setCatalogFilters({...catalogFilters, search: e.target.value})}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-2">
                          <Form.Label>Category</Form.Label>
                          <Form.Select
                            value={catalogFilters.category}
                            onChange={(e) => setCatalogFilters({...catalogFilters, category: e.target.value})}
                          >
                            <option value="">All Categories</option>
                            {Object.entries(Category).map(([key, value]) => (
                              <option key={key} value={key}>{value}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-2">
                          <Form.Label>Genre</Form.Label>
                          <Form.Select
                            value={catalogFilters.genre}
                            onChange={(e) => setCatalogFilters({...catalogFilters, genre: e.target.value})}
                          >
                            <option value="">All Genres</option>
                            {Object.entries(Genre).map(([key, value]) => (
                              <option key={key} value={key}>{value}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-2">
                          <Form.Label>Status</Form.Label>
                          <Form.Select
                            value={catalogFilters.status}
                            onChange={(e) => setCatalogFilters({...catalogFilters, status: e.target.value})}
                          >
                            <option value="">All Statuses</option>
                            {Object.entries(Status).map(([key, value]) => (
                              <option key={key} value={key}>{value}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-2">
                          <Form.Label>Price Range</Form.Label>
                          <div className="d-flex gap-2">
                            <Form.Control
                              type="number"
                              placeholder="Min"
                              value={catalogFilters.priceRange.min}
                              onChange={(e) => setCatalogFilters({
                                ...catalogFilters,
                                priceRange: {...catalogFilters.priceRange, min: e.target.value}
                              })}
                            />
                            <Form.Control
                              type="number"
                              placeholder="Max"
                              value={catalogFilters.priceRange.max}
                              onChange={(e) => setCatalogFilters({
                                ...catalogFilters,
                                priceRange: {...catalogFilters.priceRange, max: e.target.value}
                              })}
                            />
                          </div>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-2">
                          <Form.Label>Stock Status</Form.Label>
                          <Form.Select
                            value={catalogFilters.stockStatus}
                            onChange={(e) => setCatalogFilters({...catalogFilters, stockStatus: e.target.value})}
                          >
                            <option value="">All</option>
                            <option value="inStock">In Stock</option>
                            <option value="lowStock">Low Stock</option>
                            <option value="outOfStock">Out of Stock</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="d-flex justify-content-end mt-2">
                      <Button
                        variant="outline-secondary"
                        className="me-2"
                        onClick={() => setCatalogFilters({
                          search: '',
                          category: '',
                          genre: '',
                          status: '',
                          priceRange: { min: '', max: '' },
                          stockStatus: ''
                        })}
                      >
                        <FaTimes className="me-1" /> Clear
                      </Button>
                      <Button variant="primary">
                        <FaFilter className="me-1" /> Apply Filters
                      </Button>
                    </div>
                  </Card.Body>
                </Card>

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
                    {filteredBooks.map(book => (
                        <tr key={book.bookId}>
                          <td>{book.bookId.substring(0, 8)}...</td>
                        <td>{book.title}</td>
                          <td>{book.publisher}</td>
                        <td>${book.inventories?.[0]?.price || 0}</td>
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
                <Card className="filter-card mb-3">
                  <Card.Body>
                    <h6 className="mb-3"><FaFilter className="me-2" /> Filter Orders</h6>
                    <Row className="g-2">
                      <Col md={4}>
                        <Form.Group className="mb-2">
                          <Form.Label>Search</Form.Label>
                          <Form.Control
                            type="search"
                            placeholder="Search by order ID or customer..."
                            value={orderFilters.search}
                            onChange={(e) => setOrderFilters({...orderFilters, search: e.target.value})}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-2">
                          <Form.Label>Date From</Form.Label>
                          <Form.Control
                            type="date"
                            value={orderFilters.dateFrom}
                            onChange={(e) => setOrderFilters({...orderFilters, dateFrom: e.target.value})}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-2">
                          <Form.Label>Date To</Form.Label>
                          <Form.Control
                            type="date"
                            value={orderFilters.dateTo}
                            onChange={(e) => setOrderFilters({...orderFilters, dateTo: e.target.value})}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-2">
                          <Form.Label>Status</Form.Label>
                          <Form.Select
                            value={orderFilters.status}
                            onChange={(e) => setOrderFilters({...orderFilters, status: e.target.value})}
                          >
                            <option value="">All Status</option>
                            <option value="0">Pending</option>
                            <option value="1">Completed</option>
                            <option value="2">Cancelled</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-2">
                          <Form.Label>Amount Range</Form.Label>
                          <div className="d-flex gap-2">
                            <Form.Control
                              type="number"
                              placeholder="Min $"
                              value={orderFilters.minAmount}
                              onChange={(e) => setOrderFilters({...orderFilters, minAmount: e.target.value})}
                            />
                            <Form.Control
                              type="number"
                              placeholder="Max $"
                              value={orderFilters.maxAmount}
                              onChange={(e) => setOrderFilters({...orderFilters, maxAmount: e.target.value})}
                            />
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="d-flex justify-content-end mt-2">
                      <Button
                        variant="outline-secondary"
                        className="me-2"
                        onClick={() => setOrderFilters({
                          dateFrom: '',
                          dateTo: '',
                          status: '',
                          search: '',
                          minAmount: '',
                          maxAmount: ''
                        })}
                      >
                        <FaTimes className="me-1" /> Clear
                      </Button>
                      <Button variant="primary">
                        <FaFilter className="me-1" /> Apply Filters
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
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
                    {filteredOrders.map(order => (
                      <tr key={order.orderId || order.id}>
                        <td>{order.orderId ? order.orderId.substring(0, 8) : order.id}</td>
                        <td>
                          {order.user ? (
                            <>
                              {order.user.firstName} {order.user.lastName}
                              <br />
                              <small className="text-muted">{order.user.email}</small>
                            </>
                          ) : (
                            order.userName || order.customer || 'Unknown'
                          )}
                        </td>
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

          {/* Notifications Management */}
          <Tab.Pane active={activeTab === 'notifications'}>
            <Card>
              <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Notification Management</h5>
                <Button variant="primary" onClick={() => setShowNotificationModal(true)}>
                  <FaPlus className="me-2" />
                  Send Notification
                </Button>
              </Card.Header>
              <Card.Body>
                {loadingNotifications ? (
                  <div className="text-center py-4">
                    <p>Loading notifications...</p>
                  </div>
                ) : (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Message</th>
                        <th>Recipient</th>
                        <th>Date</th>
                        <th>Read</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.map(notification => (
                        <tr key={notification.notificationId}>
                          <td>{notification.notificationId}</td>
                          <td>{notification.title || 'No Title'}</td>
                          <td>{notification.message}</td>
                          <td>{notification.isGlobal ? 'All Users' : notification.userId}</td>
                          <td>{new Date(notification.createdDate).toLocaleDateString()}</td>
                          <td>
                            <Badge bg={notification.isRead ? 'success' : 'warning'}>
                              {notification.isRead ? 'Read' : 'Unread'}
                            </Badge>
                          </td>
                          <td>
                            {!notification.isRead && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="me-2"
                                onClick={() => {
                                  // Debug log to check notification object
                                  console.log('Notification object:', notification);
                                  // Use id property if notificationId is not available
                                  const id = notification.notificationId || notification.id;
                                  console.log('Using notification ID:', id);
                                  handleMarkAsRead(id);
                                }}
                              >
                                <FaCheck />
                              </Button>
                            )}
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => {
                                // Debug log to check notification object
                                console.log('Deleting notification:', notification);
                                // Use id property if notificationId is not available
                                const id = notification.notificationId || notification.id;
                                console.log('Using notification ID for deletion:', id);
                                handleDeleteNotification(id);
                              }}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {notifications.length === 0 && (
                        <tr>
                          <td colSpan="7" className="text-center py-3">
                            No notifications found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                )}
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

      {/* Send Notification Modal */}
      <Modal show={showNotificationModal} onHide={() => setShowNotificationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Send Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Notification title"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Notification message"
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Send to all users"
                checked={notificationForm.isGlobal}
                onChange={(e) => setNotificationForm({...notificationForm, isGlobal: e.target.checked})}
              />
            </Form.Group>
            {!notificationForm.isGlobal && (
              <Form.Group className="mb-3">
                <Form.Label>User ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter specific user ID"
                  value={notificationForm.userId}
                  onChange={(e) => setNotificationForm({...notificationForm, userId: e.target.value})}
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNotificationModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSendNotification}>
            Send Notification
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
                  <p><strong>Customer:</strong> {selectedOrder.user ? (
                    <>
                      {selectedOrder.user.firstName} {selectedOrder.user.lastName} <br />
                      <small className="text-muted">{selectedOrder.user.email}</small>
                    </>
                  ) : (
                    selectedOrder.userName || selectedOrder.customer || 'Unknown'
                  )}</p>
                  <p><strong>Contact:</strong> {selectedOrder.user?.contact || 'N/A'}</p>
                  <p><strong>Address:</strong> {selectedOrder.user ? (
                    `${selectedOrder.user.street}, ${selectedOrder.user.city}`
                  ) : 'N/A'}</p>
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
