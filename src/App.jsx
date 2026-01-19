import React, { useState, useEffect } from 'react';
import RecitalPlannerDashboard from './components/RecitalPlannerDashboard';
import BackstageCheckIn from './components/BackstageCheckIn';
import QRCodeGenerator from './components/QRCodeGenerator';
import { detectConflicts } from './core/conflictEngine';
import { fetchSheetData, saveSchedule, updateDancerStatus, updateDancerMeasurements, signOut } from './services/googleSheets';
import './App.css';

function App() {
  const [dancers, setDancers] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [theaterMode, setTheaterMode] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showQRGenerator, setShowQRGenerator] = useState(false);

  useEffect(() => {
    // Placeholder: Load data from Google Sheets
    const loadData = async () => {
      const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID || 'sheetId';
      const data = await fetchSheetData(sheetId);
      setDancers(data);
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

  const handleUpdateDancer = async (updatedDancer) => {
    // Optimistic update
    setDancers(dancers.map(d => d.id === updatedDancer.id ? updatedDancer : d));
    
    if (updatedDancer.rowIndex) {
      try {
        await updateDancerMeasurements(updatedDancer.rowIndex, {
          girth: updatedDancer.girth,
          chest: updatedDancer.chest,
          waist: updatedDancer.waist,
          hips: updatedDancer.hips,
        });
      } catch (error) {
        console.error("Failed to sync measurements to Google Sheets", error);
        alert("Failed to save measurements to Google Sheets. Please check your connection.");
      }
    }
  };

  const handleUpdateCheckInStatus = async (dancerId, status) => {
    // Optimistic update
    setDancers(dancers.map(d => d.id === dancerId ? { ...d, checkInStatus: status } : d));
    
    const dancer = dancers.find(d => d.id === dancerId);
    if (dancer && dancer.rowIndex) {
      try {
        await updateDancerStatus(dancer.rowIndex, status);
      } catch (error) {
        console.error("Failed to sync status to Google Sheets", error);
        alert("Failed to save status to Google Sheets. Please check your connection.");
      }
    }
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
        <button onClick={() => setShowQRGenerator(true)} className="qr-generate-btn">Generate QR Codes</button>
        <button onClick={signOut} className="sign-out-btn">Sign Out</button>
      </div>
      <h1>Recital Planner MVP</h1>
      {currentView === 'dashboard' ? (
        <RecitalPlannerDashboard dancers={dancers} conflicts={conflicts} onAddDancer={handleAddDancer} onUpdateDancer={handleUpdateDancer} schedules={schedules} onAddSchedule={handleAddSchedule} />
      ) : (
        <BackstageCheckIn dancers={dancers} onUpdateStatus={handleUpdateCheckInStatus} theaterMode={theaterMode} />
      )}
      
      {showQRGenerator && (
        <QRCodeGenerator 
          dancers={dancers} 
          onClose={() => setShowQRGenerator(false)}
        />
      )}
    </div>
  );
}

export default App;
