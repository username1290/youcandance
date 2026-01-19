import React, { useState } from 'react';

const MeasurementDashboard = ({ dancers, onUpdateDancer }) => {
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({});

  const handleEdit = (dancer) => {
    setEditing(dancer.id);
    setEditData({ ...dancer });
  };

  const handleSave = () => {
    onUpdateDancer(editData);
    setEditing(null);
  };

  const handleChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  return (
    <div className="measurement-dashboard">
      <h3>Measurement Dashboard</h3>
      {dancers.map(dancer => (
        <div key={dancer.id} className="dancer-measurements">
          <h4>{dancer.name}</h4>
          {editing === dancer.id ? (
            <div>
              <label>Girth: <input type="number" value={editData.girth || ''} onChange={(e) => handleChange('girth', e.target.value)} /></label>
              <label>Chest: <input type="number" value={editData.chest || ''} onChange={(e) => handleChange('chest', e.target.value)} /></label>
              <label>Waist: <input type="number" value={editData.waist || ''} onChange={(e) => handleChange('waist', e.target.value)} /></label>
              <label>Hips: <input type="number" value={editData.hips || ''} onChange={(e) => handleChange('hips', e.target.value)} /></label>
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setEditing(null)}>Cancel</button>
            </div>
          ) : (
            <div>
              <p>Girth: {dancer.girth} cm</p>
              <p>Chest: {dancer.chest} cm</p>
              <p>Waist: {dancer.waist} cm</p>
              <p>Hips: {dancer.hips} cm</p>
              <button onClick={() => handleEdit(dancer)}>Edit</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MeasurementDashboard;