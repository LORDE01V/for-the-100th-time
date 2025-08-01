// frontend/src/pages/Calendar.js
import React, { useState } from 'react';
import EventCreation from './EventCreation';

const Calendar = () => {
    const [events, setEvents] = useState([]);

    const updateCalendar = (newEvent) => {
        setEvents((prevEvents) => [...prevEvents, newEvent]); // Add the new event to the existing events
    };

    return (
        <div>
            <h1>Event Calendar</h1>
            <EventCreation onEventCreated={updateCalendar} />
            {/* Render your calendar here using the events state */}
            <ul>
                {events.map((event, index) => (
                    <li key={index}>{event.title} - {event.date}</li>
                ))}
            </ul>
        </div>
    );
};

export default Calendar;
