import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import announcementService from '../api/announcementService';
import './Announcement.css';

const Announcement = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAnnouncement, setCurrentAnnouncement] = useState({
        id: null,
        type: '',
        description: '',
        endDate: ''
    });

    // Fetch announcements from API
    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const data = await announcementService.getAllAnnouncements();
                console.log(data)
                setAnnouncements(data);
            } catch (error) {
                console.error('Failed to fetch announcements:', error);
            }
        };

        fetchAnnouncements();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentAnnouncement({ ...currentAnnouncement, [name]: value });
    };

    const resetForm = () => {
        setCurrentAnnouncement({
            id: null,
            type: '',
            description: '',
            endDate: ''
        });
        setIsEditing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await announcementService.updateAnnouncement(currentAnnouncement.id, currentAnnouncement);
                setAnnouncements(announcements.map((a) => a.id === currentAnnouncement.id ? currentAnnouncement : a));
            } else {
                const newAnnouncement = await announcementService.createAnnouncement(currentAnnouncement);
                setAnnouncements([...announcements, newAnnouncement]);
            }
            resetForm();
            setShowForm(false);
        } catch (error) {
            console.error('Error saving announcement:', error);
            alert('Failed to save announcement. Please try again.');
        }
    };

    const editAnnouncement = (announcement) => {
        setCurrentAnnouncement(announcement);
        setIsEditing(true);
        setShowForm(true);
    };

    const deleteAnnouncement = async (id) => {
        try {
            await announcementService.deleteAnnouncement(id);
            setAnnouncements(announcements.filter((a) => a.id !== id));
        } catch (error) {
            console.error('Error deleting announcement:', error);
            alert('Failed to delete announcement. Please try again.');
        }
    };

    return (
        <div className="announcement-container">
            <div className="announcement-header">
                <h2>Announcements</h2>
                <button className="add-announcement-btn" onClick={() => setShowForm(!showForm)}>
                    <FaPlus /> New Announcement
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="announcement-form">
                    <h3>{isEditing ? 'Edit Announcement' : 'Add New Announcement'}</h3>
                    <input name="type" value={currentAnnouncement.type} onChange={handleInputChange} placeholder="Type" required />
                    <textarea name="description" value={currentAnnouncement.description} onChange={handleInputChange} placeholder="Description" required></textarea>
                    <input type="date" name="endDate" value={currentAnnouncement.endDate} onChange={handleInputChange} required />
                    <button type="submit">{isEditing ? 'Update' : 'Add'}</button>
                </form>
            )}

            <div className="announcements-list">
                {announcements.map((announcement, index) => (
                    <div key={announcement.id || index} className="announcement-card">
                        <h4>{announcement.type}</h4>
                        <p>{announcement.description}</p>
                        <small>{announcement.endDate}</small>
                        <button onClick={() => editAnnouncement(announcement)}><FaEdit /></button>
                        <button onClick={() => deleteAnnouncement(announcement.id)}><FaTrash /></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Announcement;
