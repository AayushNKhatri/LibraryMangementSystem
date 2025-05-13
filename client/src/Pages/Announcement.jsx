import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaBullhorn, FaCalendarAlt, FaTag, FaInfoCircle } from 'react-icons/fa';
import announcementService, { AnnouncementType } from '../api/announcementService';
import './Announcement.css';

const Announcement = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch active announcements from API
    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                setLoading(true);
                const data = await announcementService.getAllAnnouncements();
                console.log('Raw announcement data:', data);

                if (data && data.length > 0) {
                    // Transform data to handle UI needs
                    const transformedData = data.map(item => ({
                        id: item.announcementId,
                        type: item.announcementType,
                        content: item.announcementDescription,
                        startDate: new Date(item.startDate).toLocaleDateString(),
                        endDate: new Date(item.endDate).toLocaleDateString(),
                        isActive: new Date() <= new Date(item.endDate)
                    }));

                    setAnnouncements(transformedData);
                    setError(null);
                } else {
                    setAnnouncements([]);
                }
            } catch (error) {
                console.error('Failed to fetch announcements:', error);
                setError('Failed to load announcements. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    // Function to get announcement type icon
    const getAnnouncementIcon = (type) => {
        switch (type) {
            case AnnouncementType.Deal:
                return <FaTag className="announcement-icon deal" />;
            case AnnouncementType.New_Arrival:
                return <FaBullhorn className="announcement-icon new-arrival" />;
            case AnnouncementType.Information:
                return <FaInfoCircle className="announcement-icon info" />;
            default:
                return <FaBullhorn className="announcement-icon" />;
        }
    };

    // Function to get announcement type name
    const getAnnouncementTypeName = (type) => {
        switch (type) {
            case AnnouncementType.Deal:
                return 'Deal';
            case AnnouncementType.New_Arrival:
                return 'New Arrival';
            case AnnouncementType.Information:
                return 'Information';
            default:
                return 'Announcement';
        }
    };

    // Function to get announcement type badge color
    const getAnnouncementBadgeColor = (type) => {
        switch (type) {
            case AnnouncementType.Deal:
                return 'success';
            case AnnouncementType.New_Arrival:
                return 'primary';
            case AnnouncementType.Information:
                return 'info';
            default:
                return 'secondary';
        }
    };

    return (
        <Container className="announcement-page py-5">
            <div className="text-center mb-5">
                <h1 className="display-4">Announcements</h1>
                <p className="lead text-muted">Stay updated with the latest news and offers from our library</p>
            </div>

            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-3">Loading announcements...</p>
                </div>
            ) : error ? (
                <Alert variant="danger" className="my-4">
                    <FaInfoCircle className="me-2" />
                    {error}
                </Alert>
            ) : announcements.length === 0 ? (
                <Alert variant="info" className="my-4 text-center">
                    <FaInfoCircle className="me-2" />
                    There are no active announcements at this time.
                </Alert>
            ) : (
                <Row className="g-4">
                    {announcements.map((announcement) => (
                        <Col key={announcement.id} xs={12} md={6} lg={4}>
                            <Card className={`announcement-card ${announcement.isActive ? 'active' : 'expired'}`}>
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="d-flex align-items-center">
                                            {getAnnouncementIcon(announcement.type)}
                                            <Badge bg={getAnnouncementBadgeColor(announcement.type)} className="ms-2">
                                                {getAnnouncementTypeName(announcement.type)}
                                            </Badge>
                                        </div>
                                        {!announcement.isActive && (
                                            <Badge bg="warning" text="dark">Expired</Badge>
                                        )}
                                    </div>
                                    <Card.Text className="announcement-content">{announcement.content}</Card.Text>
                                    <div className="announcement-dates mt-3 text-muted">
                                        <small className="d-flex align-items-center">
                                            <FaCalendarAlt className="me-1" />
                                            Valid: {announcement.startDate} - {announcement.endDate}
                                        </small>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default Announcement;
