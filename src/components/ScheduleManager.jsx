import React, { useState } from 'react';

const ScheduleManager = ({ schedules, onAddSchedule, dancers }) => {
  const [newSchedule, setNewSchedule] = useState({ title: '', date: '', time: '', assignedDancers: [] });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newSchedule.title && newSchedule.date) {
      onAddSchedule({ ...newSchedule, id: Date.now() });
      setNewSchedule({ title: '', date: '', time: '', assignedDancers: [] });
    }
  };

  const handleDancerToggle = (dancerId) => {
    setNewSchedule(prev => ({
      ...prev,
      assignedDancers: prev.assignedDancers.includes(dancerId)
        ? prev.assignedDancers.filter(id => id !== dancerId)
        : [...prev.assignedDancers, dancerId]
    }));
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
        <div>
          <label>Assign Dancers:</label>
          {dancers.map(dancer => (
            <label key={dancer.id}>
              <input
                type="checkbox"
                checked={newSchedule.assignedDancers.includes(dancer.id)}
                onChange={() => handleDancerToggle(dancer.id)}
              />
              {dancer.name}
            </label>
          ))}
        </div>
        <button type="submit">Add Event</button>
      </form>
      <ul>
        {schedules.map(schedule => (
          <li key={schedule.id}>
            <strong>{schedule.title}</strong> - {schedule.date} {schedule.time}
            <br />
            Assigned: {schedule.assignedDancers.map(id => dancers.find(d => d.id === id)?.name).join(', ') || 'None'}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ScheduleManager;