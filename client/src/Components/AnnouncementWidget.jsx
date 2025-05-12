import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBullhorn } from 'react-icons/fa';
import './AnnouncementWidget.css';
// import announcementService from '../api/announcementService';

const AnnouncementWidget = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                // Uncomment to use the actual API
                // const data = await announcementService.getActiveAnnouncements();
                // setAnnouncements(data);
                
                // Mock data for demonstration
                const mockAnnouncements = [
                    {
                        id: 1,
                        type: 'Event',
                        description: 'Book fair happening this weekend at the central library',
                        endDate: '2023-12-31'
                    },
                    {
                        id: 2,
                        type: 'Notice',
                        description: 'Library will be closed for maintenance on Monday',
                        endDate: '2023-12-25'
                    }
                ];
                
                setAnnouncements(mockAnnouncements);
            } catch (error) {
                console.error('Failed to fetch announcements:', error);
            }
        };

        fetchAnnouncements();
        
        // Auto rotate announcements
        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => {
                if (announcements.length === 0) return 0;
                return prevIndex === announcements.length - 1 ? 0 : prevIndex + 1;
            });
        }, 5000);
        
        return () => clearInterval(interval);
    }, [announcements.length]);

    if (announcements.length === 0) {
        return null;
    }

    const currentAnnouncement = announcements[currentIndex];

    return (
        <div className="announcement-widget">
            <div className="widget-content">
                <FaBullhorn className="widget-icon" />
                <p className="widget-text">
                    <span className="widget-type">{currentAnnouncement.type}:</span> {currentAnnouncement.description}
                </p>
            </div>
            <div className="widget-nav">
                {announcements.map((_, index) => (
                    <span 
                        key={index}
                        className={`nav-dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                    />
                ))}
            </div>
            <Link to="/announcements" className="widget-link">View All</Link>
        </div>
    );
};

export default AnnouncementWidget; 