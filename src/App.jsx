import React, { useState, useEffect } from 'react';
import MeasurementDashboard from './components/MeasurementDashboard';
import { detectConflicts } from './core/conflictEngine';
import { fetchSheetData } from './services/googleSheets';
import './App.css';

function App() {
  const [dancers, setDancers] = useState([]);
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    // Placeholder: Load data from Google Sheets
    const loadData = async () => {
      const data = await fetchSheetData('sheetId'); // Replace with actual sheet ID
      setDancers(data);
      setConflicts(detectConflicts([], data)); // Placeholder showOrder
    };
    loadData();
  }, []);

  return (
    <div className="App">
      <h1>Recital Planner MVP</h1>
      <MeasurementDashboard dancers={dancers} />
      <div>
        <h2>Conflicts</h2>
        <ul>
          {conflicts.map(conflict => <li key={conflict.id}>{conflict.name}</li>)}
        </ul>
      </div>
    </div>
  );
}

export default App;
