import React, { useState, useEffect } from 'react';
import RecitalPlannerDashboard from './components/RecitalPlannerDashboard';
import { detectConflicts } from './core/conflictEngine';
import { fetchSheetData, saveSchedule } from './services/googleSheets';
import './App.css';

function App() {
  const [dancers, setDancers] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [theaterMode, setTheaterMode] = useState(false);

  useEffect(() => {
    // Placeholder: Load data from Google Sheets
    const loadData = async () => {
      const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID || 'sheetId';
      const data = await fetchSheetData(sheetId);
      setDancers(data);
      setConflicts(detectConflicts([], data)); // Placeholder showOrder
    };
    loadData();
  }, []);

  const handleAddDancer = (newDancer) => {
    const dancer = { ...newDancer, id: Date.now() }; // Simple ID generation
    setDancers([...dancers, dancer]);
    // In real app, save to Google Sheets
  };

  const handleUpdateDancer = (updatedDancer) => {
    setDancers(dancers.map(d => d.id === updatedDancer.id ? updatedDancer : d));
    // In real app, update Google Sheets
  };

  const handleAddSchedule = async (newSchedule) => {
    setSchedules([...schedules, newSchedule]);
    // Save to Google Sheets
    const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID;
    await saveSchedule(sheetId, newSchedule);
  };

  return (
    <div className={`App ${theaterMode ? 'theater-mode' : ''}`}>
      <button onClick={() => setTheaterMode(!theaterMode)} className="toggle-theater">
        {theaterMode ? 'Exit Theater Mode' : 'Enter Theater Mode'}
      </button>
      <h1>Recital Planner MVP</h1>
      <RecitalPlannerDashboard dancers={dancers} conflicts={conflicts} onAddDancer={handleAddDancer} onUpdateDancer={handleUpdateDancer} schedules={schedules} onAddSchedule={handleAddSchedule} />
    </div>
  );
}

export default App;
