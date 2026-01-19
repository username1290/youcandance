import React, { useState } from 'react';

const ScheduleManager = ({ schedules, onAddSchedule, dancers }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [assignedDancers, setAssignedDancers] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title && date) {
      console.log('Creating schedule with assigned dancers:', assignedDancers);
      onAddSchedule({ title, date, time, assignedDancers, id: Date.now() });
      setTitle('');
      setDate('');
      setTime('');
      setAssignedDancers([]);
    }
  };

  const handleDancerToggle = (dancerId) => {
    console.log('Toggling dancer:', dancerId, 'Current selection:', assignedDancers);
    setAssignedDancers(prev =>
      prev.includes(dancerId)
        ? prev.filter(id => id !== dancerId)
        : [...prev, dancerId]
    );
  };

  return (
    <section>
      <h3>Recital Schedule</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <div>
          <label>Assign Dancers:</label>
          <div className="dancers-list">
            {dancers && dancers.length > 0 ? (
              dancers.map(dancer => (
                <div key={`dancer-${dancer.id}`} className="dancer-item">
                  <input
                    type="checkbox"
                    id={`dancer-checkbox-${dancer.id}`}
                    checked={assignedDancers.includes(dancer.id)}
                    onChange={() => handleDancerToggle(dancer.id)}
                  />
                  <label htmlFor={`dancer-checkbox-${dancer.id}`}>
                    {dancer.name} {dancer.role ? `(${dancer.role})` : ''}
                  </label>
                </div>
              ))
            ) : (
              <p>No dancers available</p>
            )}
          </div>
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