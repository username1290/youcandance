import React, { useState } from 'react';

const ScheduleManager = ({ schedules, onAddSchedule }) => {
  const [newSchedule, setNewSchedule] = useState({ title: '', date: '', time: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newSchedule.title && newSchedule.date) {
      onAddSchedule({ ...newSchedule, id: Date.now() });
      setNewSchedule({ title: '', date: '', time: '' });
    }
  };

  return (
    <section>
      <h3>Recital Schedule</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Event Title"
          value={newSchedule.title}
          onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
        />
        <input
          type="date"
          value={newSchedule.date}
          onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
        />
        <input
          type="time"
          value={newSchedule.time}
          onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
        />
        <button type="submit">Add Event</button>
      </form>
      <ul>
        {schedules.map(schedule => (
          <li key={schedule.id}>
            {schedule.title} - {schedule.date} {schedule.time}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ScheduleManager;