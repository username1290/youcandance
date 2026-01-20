import React, { useState } from 'react';
import MeasurementDashboard from './MeasurementDashboard';
import DragDropScheduleManager from './DragDropScheduleManager';
import LoadingSkeleton from './LoadingSkeleton';

const RecitalPlannerDashboard = ({ dancers, conflicts, onAddDancer, onUpdateDancer, schedules, onAddSchedule, loading = false }) => {
  const [newDancer, setNewDancer] = useState({ name: '', role: '' });

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSkeleton type="text" width="30%" height="32px" count={1} gap="20px" />
        
        <div className="skeleton-grid">
          <div className="skeleton-card">
            <LoadingSkeleton type="text" width="60%" height="24px" count={1} gap="15px" />
            <LoadingSkeleton type="rect" width="100%" height="100px" count={1} gap="15px" />
            <LoadingSkeleton type="text" width="40%" height="20px" count={1} gap="10px" />
          </div>
          
          <div className="skeleton-card">
            <LoadingSkeleton type="text" width="60%" height="24px" count={1} gap="15px" />
            <LoadingSkeleton type="rect" width="100%" height="100px" count={1} gap="15px" />
            <LoadingSkeleton type="text" width="40%" height="20px" count={1} gap="10px" />
          </div>
          
          <div className="skeleton-card">
            <LoadingSkeleton type="text" width="60%" height="24px" count={1} gap="15px" />
            <LoadingSkeleton type="rect" width="100%" height="100px" count={1} gap="15px" />
            <LoadingSkeleton type="text" width="40%" height="20px" count={1} gap="10px" />
          </div>
        </div>
        
        <LoadingSkeleton type="rect" width="100%" height="200px" count={1} gap="20px" />
      </div>
    );
  }

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
      <DragDropScheduleManager schedules={schedules} onAddSchedule={onAddSchedule} dancers={dancers} conflicts={conflicts} />
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