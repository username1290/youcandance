import React, { useState, useEffect } from 'react';
import RecitalPlannerDashboard from './components/RecitalPlannerDashboard';
import BackstageCheckIn from './components/BackstageCheckIn';
import { detectConflicts } from './core/conflictEngine';
import { fetchSheetData, saveSchedule } from './services/googleSheets';
import './App.css';

function App() {
  const [dancers, setDancers] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [theaterMode, setTheaterMode] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    // Placeholder: Load data from Google Sheets
    const loadData = async () => {
      const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID || 'sheetId';
      const data = await fetchSheetData(sheetId);
      setDancers(data.map(d => ({ ...d, checkInStatus: 'Not Ready' })));
    };
    loadData();
  }, []);

  // Re-run conflict detection when dancers or schedules change
  useEffect(() => {
    if (dancers.length > 0 && schedules.length > 0) {
      const newConflicts = detectConflicts(schedules, dancers);
      setConflicts(newConflicts);
    }
  }, [dancers, schedules]);

  const handleAddDancer = (newDancer) => {
    const dancer = { ...newDancer, id: Date.now() }; // Simple ID generation
    setDancers([...dancers, dancer]);
    // In real app, save to Google Sheets
  };

  const handleUpdateDancer = (updatedDancer) => {
    setDancers(dancers.map(d => d.id === updatedDancer.id ? updatedDancer : d));
    // In real app, update Google Sheets
  };

  const handleUpdateCheckInStatus = (dancerId, status) => {
    setDancers(dancers.map(d => d.id === dancerId ? { ...d, checkInStatus: status } : d));
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
      <div className="view-switcher">
        <button onClick={() => setCurrentView('dashboard')}>Dashboard</button>
        <button onClick={() => setCurrentView('checkin')}>Backstage Check-In</button>
      </div>
      <h1>Recital Planner MVP</h1>
      {currentView === 'dashboard' ? (
        <RecitalPlannerDashboard dancers={dancers} conflicts={conflicts} onAddDancer={handleAddDancer} onUpdateDancer={handleUpdateDancer} schedules={schedules} onAddSchedule={handleAddSchedule} />
      ) : (
        <BackstageCheckIn dancers={dancers} onUpdateStatus={handleUpdateCheckInStatus} theaterMode={theaterMode} />
      )}
    </div>
  );
}

export default App;
