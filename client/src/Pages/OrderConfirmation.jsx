import React, { useRef, useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaCopy, FaDownload } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './OrderConfirmation.css';
import orderService from '../api/OrderServer';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const confirmationRef = useRef(null);
  const claimCodeRef = useRef(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        
        // If order is passed via location state, use it
        if (location.state?.order) {
          setOrder(location.state.order);
        } else {
          // Otherwise call the API to get the latest order
          const response = await orderService.confirmOrder();
          if (response) {
            setOrder(response);
          } else {
            setError("No order information available. Please try again.");
          }
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order information. Please check your orders in your profile.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [location]);

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Copy claim code to clipboard
  const copyClaimCode = () => {
    if (order?.claimsCode) {
      navigator.clipboard.writeText(order.claimsCode.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generate and download PDF
  const downloadPDF = async () => {
    if (!confirmationRef.current) return;

    setLoading(true);
    try {
      const canvas = await html2canvas(confirmationRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`order-confirmation-${order?.orderId?.substring(0, 8) || 'receipt'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show error page if needed
  if (error) {
    return (
      <Container className="py-5 text-center">
        <div className="text-danger mb-4">
          <FaCheckCircle size={80} className="text-danger mb-3" />
          <h2>Error Loading Order</h2>
        </div>
        <p>{error}</p>
        <Button variant="primary" onClick={() => navigate('/cart')}>
          Return to Cart
        </Button>
      </Container>
    );
  }

  // If still loading, show spinner
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading order details...</p>
      </Container>
    );
  }

  // If no order, show error
  if (!order) {
    return (
      <Container className="py-5 text-center">
        <div className="text-warning mb-4">
          <FaCheckCircle size={80} className="text-warning mb-3" />
          <h2>No Order Found</h2>
        </div>
        <p>No order information is available. Please return to your cart.</p>
        <Button variant="primary" onClick={() => navigate('/cart')}>
          Return to Cart
        </Button>
      </Container>
    );
  }

  return (
    <Container className="order-confirmation py-5">
      <div className="text-center mb-5">
        <div className="success-checkmark">
          <FaCheckCircle size={80} className="text-success mb-3" />
        </div>
        <h1 className="display-4">Order Confirmed!</h1>
        <p className="lead">Thank you for your purchase. Your order has been successfully placed.</p>
      </div>

      <div ref={confirmationRef} className="confirmation-details">
        <Card className="mb-4 border-0 shadow">
          <Card.Body className="p-4">
            <Row>
              <Col md={6}>
                <h3 className="mb-4">Order Summary</h3>
                <p><strong>Order ID:</strong> #{order.orderId?.substring(0, 8)}</p>
                <p><strong>Date:</strong> {formatDate(order.orderDate)}</p>
                <p><strong>Status:</strong> <span className="badge bg-warning">Pending</span></p>
                <p><strong>Total Items:</strong> {order.bookCount}</p>
                <p><strong>Total Amount:</strong> ${order.totalAmount?.toFixed(2)}</p>
                {order.discountApplied > 0 && (
                  <p><strong>Discount Applied:</strong> {order.discountApplied}%</p>
                )}
              </Col>
              <Col md={6} className="claim-code-section">
                <h3 className="mb-4">Claim Code</h3>
                <Alert variant="light" className="claim-code-box">
                  <div ref={claimCodeRef} className="claim-code-display">
                    {order.claimsCode || 'N/A'}
                  </div>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="copy-btn" 
                    onClick={copyClaimCode}
                    disabled={!order.claimsCode}
                  >
                    {copied ? 'Copied!' : <><FaCopy className="me-2" /> Copy</>}
                  </Button>
                </Alert>
                <p className="text-muted small">
                  Use this claim code when picking up your order from our store.
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <div className="d-flex justify-content-between">
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/books')}
          >
            Continue Shopping
          </Button>
          <Button 
            variant="primary" 
            onClick={downloadPDF} 
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : (
              <FaDownload className="me-2" />
            )}
            Download Receipt
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default OrderConfirmation; 