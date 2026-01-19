import React from 'react';

const MeasurementDashboard = ({ dancers }) => (
  <div className="theater-mode">
    {dancers.map(dancer => (
      <div key={dancer.id}>
        <h3>{dancer.name}</h3>
        <p>Girth: {dancer.girth} cm</p>
        <p>Chest: {dancer.chest} cm</p>
        <p>Waist: {dancer.waist} cm</p>
        <p>Hips: {dancer.hips} cm</p>
      </div>
    ))}
  </div>
);

export default MeasurementDashboard;