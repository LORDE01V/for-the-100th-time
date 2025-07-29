// frontend/src/pages/EventCreation.js
import React, { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import axios from 'axios';

const EventCreation = ({ onEventCreated }) => { // Accepting a prop to handle event creation
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('/api/events', { title, date, description });
            // Call the passed function to update the calendar
            onEventCreated(response.data.event); // Use the prop function to update the calendar
        } catch (err) {
            setError('Failed to save event: ' + (err.response?.data?.error || 'Unknown error'));
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event Title" required />
            <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Event Description"></textarea>
            <button type="submit">Create Event</button>
            {error && <p>{error}</p>}
        </form>
    );
};

// Add prop types validation
EventCreation.propTypes = {
    onEventCreated: PropTypes.func.isRequired, // Validate onEventCreated as a required function
};

export default EventCreation;