import React, { useState } from 'react';
import MeasurementDashboard from './MeasurementDashboard';
import ScheduleManager from './ScheduleManager';

const RecitalPlannerDashboard = ({ dancers, conflicts, onAddDancer, onUpdateDancer, schedules, onAddSchedule }) => {
  const [newDancer, setNewDancer] = useState({ name: '', role: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newDancer.name && newDancer.role) {
      onAddDancer(newDancer);
      setNewDancer({ name: '', role: '' });
    }
  };

  return (
    <div className="recital-planner-dashboard">
      <h2>Recital Planner Dashboard</h2>
      <section>
        <h3>Add Dancer</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={newDancer.name}
            onChange={(e) => setNewDancer({ ...newDancer, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Role"
            value={newDancer.role}
            onChange={(e) => setNewDancer({ ...newDancer, role: e.target.value })}
          />
          <button type="submit">Add</button>
        </form>
      </section>
      <section>
        <h3>Dancers</h3>
        <ul>
          {dancers.map(dancer => (
            <li key={dancer.id}>{dancer.name} - {dancer.role}</li>
          ))}
        </ul>
      </section>
      <MeasurementDashboard dancers={dancers} onUpdateDancer={onUpdateDancer} />
      <ScheduleManager schedules={schedules} onAddSchedule={onAddSchedule} dancers={dancers} />
      <section>
        <h3>Conflicts</h3>
        <ul>
          {conflicts.map(conflict => (
            <li key={conflict.id}>{conflict.description}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default RecitalPlannerDashboard;