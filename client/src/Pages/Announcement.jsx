import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Row, Col, Alert } from 'react-bootstrap';
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
                // Using getActiveAnnouncements to only show current announcements
                const data = await announcementService.getAllAnnouncements();
<<<<<<< HEAD

                console.log(data);
                
                // Transform data to handle UI needs
                const transformedData = data.map(item => ({
                    id: item.announcementId,
                    type: item.announcementType,
                    content: item.announcementDescription,
                    startDate: new Date(item.startDate).toLocaleDateString(),
                    endDate: new Date(item.endDate).toLocaleDateString()
                }));
                
                setAnnouncements(transformedData);
                setError(null);
=======
                console.log(data)
                setAnnouncements(data);
>>>>>>> c0e4313c2f6351d83d2c5b286a3fc2613a557b29
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

            {loading && (
                <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading announcements...</p>
                </div>
            )}

<<<<<<< HEAD
            {error && (
                <Alert variant="danger" className="my-4">
                    <FaInfoCircle className="me-2" />
                    {error}
                </Alert>
            )}

            {!loading && !error && announcements.length === 0 && (
                <Alert variant="info" className="my-4 text-center">
                    <FaInfoCircle className="me-2" />
                    There are no active announcements at this time.
                </Alert>
            )}

            <Row className="g-4">
                {announcements.map((announcement) => (
                    <Col key={announcement.id} xs={12} md={6} lg={4}>
                        <Card className={`announcement-card ${getAnnouncementTypeName(announcement.type).toLowerCase().replace(' ', '-')}`}>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="d-flex align-items-center">
                                        {getAnnouncementIcon(announcement.type)}
                                        <Badge bg={getAnnouncementBadgeColor(announcement.type)} className="ms-2">
                                            {getAnnouncementTypeName(announcement.type)}
                                        </Badge>
                                    </div>
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
=======
            <div className="announcements-list">
                {announcements.map((announcement, index) => (
                    <div key={announcement.id || index} className="announcement-card">
                        <h4>{announcement.type}</h4>
                        <p>{announcement.description}</p>
                        <small>{announcement.endDate}</small>
                        <button onClick={() => editAnnouncement(announcement)}><FaEdit /></button>
                        <button onClick={() => deleteAnnouncement(announcement.id)}><FaTrash /></button>
                    </div>
>>>>>>> c0e4313c2f6351d83d2c5b286a3fc2613a557b29
                ))}
            </Row>
        </Container>
    );
};

export default Announcement;
