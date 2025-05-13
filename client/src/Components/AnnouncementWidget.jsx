import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBullhorn, FaTag, FaInfoCircle } from 'react-icons/fa';
import './AnnouncementWidget.css';
import announcementService, { AnnouncementType } from '../api/announcementService';

const AnnouncementWidget = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                setLoading(true);
                const data = await announcementService.getAllAnnouncements();
                
                if (data && data.length > 0) {
                    console.log('Announcement widget data:', data);
                    setAnnouncements(data);
                }
            } catch (error) {
                console.error('Failed to fetch announcements:', error);
            } finally {
                setLoading(false);
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
    }, []);

    // Update the rotation when announcements length changes
    useEffect(() => {
        if (currentIndex >= announcements.length && announcements.length > 0) {
            setCurrentIndex(0);
        }
    }, [announcements.length, currentIndex]);

    if (loading) {
        return <div className="announcement-widget-loading">Loading announcements...</div>;
    }

    if (announcements.length === 0) {
        return null;
    }

    const currentAnnouncement = announcements[currentIndex];

    // Function to get announcement type icon
    const getAnnouncementIcon = (type) => {
        switch (type) {
            case AnnouncementType.Deal:
                return <FaTag className="widget-icon deal" />;
            case AnnouncementType.New_Arrival:
                return <FaBullhorn className="widget-icon new-arrival" />;
            case AnnouncementType.Information:
                return <FaInfoCircle className="widget-icon info" />;
            default:
                return <FaBullhorn className="widget-icon" />;
        }
    };

    return (
        <div className="announcement-widget">
            <div className="widget-content">
                {getAnnouncementIcon(currentAnnouncement.announcementType)}
                <p className="widget-text">
                    {currentAnnouncement.announcementDescription}
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
