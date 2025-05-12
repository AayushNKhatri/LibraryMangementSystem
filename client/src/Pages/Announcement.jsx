import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import './Announcement.css';
// import announcementService from '../api/announcementService';

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
                // Uncomment to use the actual API
                // const data = await announcementService.getAllAnnouncements();
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
        if (!currentAnnouncement.type || !currentAnnouncement.description || !currentAnnouncement.endDate) {
            alert('All fields are required');
            return;
        }

        try {
            if (isEditing) {
                // Update existing announcement
                // Uncomment to use the actual API
                // await announcementService.updateAnnouncement(currentAnnouncement.id, currentAnnouncement);
                setAnnouncements(announcements.map(announcement => 
                    announcement.id === currentAnnouncement.id ? currentAnnouncement : announcement
                ));
            } else {
                // Add new announcement
                // Uncomment to use the actual API
                // const newAnnouncement = await announcementService.createAnnouncement(currentAnnouncement);
                const newAnnouncement = {
                    ...currentAnnouncement,
                    id: Date.now()
                };
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
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            try {
                // Uncomment to use the actual API
                // await announcementService.deleteAnnouncement(id);
                setAnnouncements(announcements.filter(announcement => announcement.id !== id));
            } catch (error) {
                console.error('Error deleting announcement:', error);
                alert('Failed to delete announcement. Please try again.');
            }
        }
    };

    return (
        <div className="announcement-container">
            <div className="announcement-header">
                <h2>Announcements</h2>
                <button 
                    className="add-announcement-btn"
                    onClick={() => {
                        resetForm();
                        setShowForm(!showForm);
                    }}
                >
                    <FaPlus /> New Announcement
                </button>
            </div>

            {showForm && (
                <div className="announcement-form-container">
                    <form onSubmit={handleSubmit} className="announcement-form">
                        <h3>{isEditing ? 'Edit Announcement' : 'Add New Announcement'}</h3>
                        
                        <div className="form-group">
                            <label htmlFor="type">Announcement Type</label>
                            <select 
                                name="type" 
                                id="type" 
                                value={currentAnnouncement.type} 
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="Event">Event</option>
                                <option value="Notice">Notice</option>
                                <option value="Update">Update</option>
                                <option value="Alert">Alert</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea 
                                name="description" 
                                id="description" 
                                value={currentAnnouncement.description} 
                                onChange={handleInputChange}
                                required
                            ></textarea>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="endDate">End Date</label>
                            <input 
                                type="date" 
                                name="endDate" 
                                id="endDate" 
                                value={currentAnnouncement.endDate} 
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div className="form-actions">
                            <button type="submit" className="submit-btn">
                                {isEditing ? 'Update' : 'Post'} Announcement
                            </button>
                            <button 
                                type="button" 
                                className="cancel-btn"
                                onClick={() => {
                                    resetForm();
                                    setShowForm(false);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="announcements-list">
                {announcements.length === 0 ? (
                    <p className="no-announcements">No announcements found</p>
                ) : (
                    announcements.map(announcement => (
                        <div key={announcement.id} className={`announcement-card ${announcement.type.toLowerCase()}`}>
                            <div className="announcement-type-badge">{announcement.type}</div>
                            <div className="announcement-content">
                                <p className="announcement-description">{announcement.description}</p>
                                <p className="announcement-date">Valid until: {new Date(announcement.endDate).toLocaleDateString()}</p>
                            </div>
                            <div className="announcement-actions">
                                <button 
                                    className="edit-btn" 
                                    onClick={() => editAnnouncement(announcement)}
                                >
                                    <FaEdit />
                                </button>
                                <button 
                                    className="delete-btn"
                                    onClick={() => deleteAnnouncement(announcement.id)}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Announcement;
