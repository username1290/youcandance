import React, { useState, useEffect, useRef } from 'react'
import RecitalPlannerDashboard from './components/RecitalPlannerDashboard'
import BackstageCheckIn from './components/BackstageCheckIn'
import QRCodeGenerator from './components/QRCodeGenerator'
import LoadingSkeleton, { DashboardSkeleton } from './components/LoadingSkeleton'
import Settings from './components/Settings' 
import Login from './components/Login'
import { detectConflicts } from './core/conflictEngine'
import {
  fetchSheetData,
  updateDancerStatus,
  updateDancerMeasurements,
  fetchRecitalEvents,
  saveRecitalEvent,
  updateRecitalEvent,
  deleteRecitalEvent,
  fetchAllRecitals,
  createRecital,
  createRecitalEventsSheet,
  // updateRecital,
  // duplicateRecital,
  signOut,
} from './services/googleSheets'
import './App.css'

function App() {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('app_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [dancers, setDancers] = useState([])
  const [conflicts, setConflicts] = useState([])
  const [schedules, setSchedules] = useState([])
  const [recitals, setRecitals] = useState([])
  const [currentRecitalId, setCurrentRecitalId] = useState(null)
  
  // New state for multi-sheet management
  const [recitalConfigs, setRecitalConfigs] = useState(() => {
    const saved = localStorage.getItem('recitalConfigs');
    // If empty, try to migrate from env var if available
    if (!saved) {
        const envSheetId = import.meta.env.VITE_GOOGLE_SHEET_ID;
        if (envSheetId) {
            return [{ name: 'Default Recital', id: envSheetId }];
        }
        return [];
    }
    return JSON.parse(saved);
  });
  
  const [activeSheetId, setActiveSheetId] = useState(() => {
     const savedConfigs = localStorage.getItem('recitalConfigs');
     const parsed = savedConfigs ? JSON.parse(savedConfigs) : [];
     
     // Fallback to env var if no configs saved
     if (parsed.length === 0) {
         return import.meta.env.VITE_GOOGLE_SHEET_ID || '';
     }
     return parsed[0].id;
  });

  const [theaterMode, setTheaterMode] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard') // 'dashboard' | 'checkin' | 'settings'
  const [showQRGenerator, setShowQRGenerator] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastSync, setLastSync] = useState(Date.now())
  const syncTimeoutRef = useRef(null)

  const handleLoginSuccess = (profile) => {
    setUser(profile);
    sessionStorage.setItem('app_user', JSON.stringify(profile));
  };

  const updateRecitalConfigs = (newConfigs) => {
    setRecitalConfigs(newConfigs);
    localStorage.setItem('recitalConfigs', JSON.stringify(newConfigs));
    
    // Auto-select first if none selected
    if (newConfigs.length > 0 && !activeSheetId) {
      setActiveSheetId(newConfigs[0].id);
    }
    // Handle case where active config was removed
    if (newConfigs.length > 0 && activeSheetId && !newConfigs.find(c => c.id === activeSheetId)) {
        setActiveSheetId(newConfigs[0].id);
    }
    // Handle case where all configs removed
    if (newConfigs.length === 0) {
        setActiveSheetId('');
        setDancers([]);
        setSchedules([]);
        setRecitals([]);
    }
  };

  // General sync function
  const syncAll = async (recitalId = currentRecitalId) => {
    if (!activeSheetId) {
        setLoading(false);
        return;
    }

    try {
      setLoading(true)
      setError(null)
      const sheetId = activeSheetId;
      
      // Load recitals metadata first
      const recitalsData = await fetchAllRecitals(sheetId)
      setRecitals(recitalsData)
      // Set first active recital as default, or first recital if none active
      if (!recitalId) {
        if (recitalsData.length > 0) {
          const firstActive = recitalsData.find((r) => r.active) || recitalsData[0]
          setCurrentRecitalId(firstActive.id)
          recitalId = firstActive.id
        } else {
          // If no recitals exist, create a default one
          console.warn('No recitals found in Sheet4. Creating default recital...')
          const defaultRecital = {
            id: 'recital-1',
            name: 'Spring Showcase 2024',
            date: new Date().toISOString().split('T')[0],
            location: 'Main Theater',
            school: 'Dance Studio',
            theme: 'Under the Sea',
            active: true,
          }
          try {
            await createRecital(sheetId, defaultRecital)
            await createRecitalEventsSheet(sheetId, 'recital-1')
            setRecitals([defaultRecital])
            setCurrentRecitalId('recital-1')
            recitalId = 'recital-1'
          } catch (error) {
            console.error('Failed to create default recital:', error)
            setRecitals([defaultRecital])
            setCurrentRecitalId('recital-1')
            recitalId = 'recital-1'
          }
        }
      }
      // Load dancers from Sheet1
      const dancersData = await fetchSheetData(sheetId)
      setDancers(dancersData)
      // Load recital events for the current recital
      if (recitalId) {
        const eventsData = await fetchRecitalEvents(sheetId, recitalId)
        console.log(`[DEBUG] App.jsx: setSchedules for ${recitalId}:`, eventsData)
        setSchedules(eventsData)
      }
      setLastSync(Date.now())
    } catch (err) {
      console.error('Failed to load data:', err)
      setError('Failed to load data. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    syncAll()
  }, [activeSheetId]) // Added activeSheetId dependency

  // Re-run conflict detection when dancers or schedules change
  useEffect(() => {
    if (dancers.length > 0 && schedules.length > 0) {
      const newConflicts = detectConflicts(schedules, dancers)
      setConflicts(newConflicts)
    }
  }, [dancers, schedules, currentRecitalId])

  // Reload schedules when current recital changes
  // Auto re-fetch on recital switch
  useEffect(() => {
    if (currentRecitalId && activeSheetId) {
      syncAll(currentRecitalId)
    }
  }, [currentRecitalId])

  // Optional: polling every 5 minutes (300000 ms)
  useEffect(() => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    const poll = () => {
        if (activeSheetId) syncAll()
      syncTimeoutRef.current = setTimeout(poll, 300000)
    }
    syncTimeoutRef.current = setTimeout(poll, 300000)
    return () => clearTimeout(syncTimeoutRef.current)
  }, [currentRecitalId, activeSheetId])

  const handleAddDancer = (newDancer) => {
    // Step 1: Use UUIDs for robust unique IDs across sheets/schools
    const dancer = { ...newDancer, id: crypto.randomUUID() } 
    setDancers([...dancers, dancer])
    // In real app, save to Google Sheets (TODO: implement addDancerToSheet)
  }

  const handleUpdateDancer = async (updatedDancer) => {
    if (!activeSheetId) return;

    // Optimistic update
    setDancers(dancers.map((d) => (d.id === updatedDancer.id ? updatedDancer : d)))

    if (updatedDancer.rowIndex) {
      try {
        await updateDancerMeasurements(updatedDancer.rowIndex, {
          girth: updatedDancer.girth,
          chest: updatedDancer.chest,
          waist: updatedDancer.waist,
          hips: updatedDancer.hips,
        }, activeSheetId)
      } catch (error) {
        console.error('Failed to sync measurements to Google Sheets', error)
        alert('Failed to save measurements to Google Sheets. Please check your connection.')
      }
    }
  }

  const handleUpdateCheckInStatus = async (dancerId, status) => {
    if (!activeSheetId) return;

    // Optimistic update
    setDancers(dancers.map((d) => (d.id === dancerId ? { ...d, checkInStatus: status } : d)))

    const dancer = dancers.find((d) => d.id === dancerId)
    if (dancer && dancer.rowIndex) {
      try {
        await updateDancerStatus(dancer.rowIndex, status, activeSheetId)
      } catch (error) {
        console.error('Failed to sync status to Google Sheets', error)
        alert('Failed to save status to Google Sheets. Please check your connection.')
      }
    }
  }

  const handleAddSchedule = async (newSchedule) => {
    if (!activeSheetId) return;

    // Optimistic update
    setSchedules([...schedules, newSchedule])

    try {
      const sheetId = activeSheetId
      const rowIndex = await saveRecitalEvent(sheetId, newSchedule, currentRecitalId)
      if (rowIndex) {
        // Update the schedule with the rowIndex so future updates work
        setSchedules(schedules.map((s) => (s.id === newSchedule.id ? { ...s, rowIndex } : s)))
      }
    } catch (error) {
      console.error('Failed to sync recital event to Google Sheets', error)
      alert('Failed to save recital event to Google Sheets. Please check your connection.')
      // Revert on error
      setSchedules(schedules)
    }
  }

  const handleUpdateSchedule = async (updatedSchedule) => {
    if (!activeSheetId) return;
    
    // Optimistic update
    setSchedules(schedules.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s)))

    if (updatedSchedule.rowIndex) {
      try {
        const sheetId = activeSheetId
        await updateRecitalEvent(
          sheetId,
          updatedSchedule.rowIndex,
          updatedSchedule,
          currentRecitalId
        )
      } catch (error) {
        console.error('Failed to sync recital event update to Google Sheets', error)
        alert('Failed to update recital event in Google Sheets. Please check your connection.')
        // Revert on error
        setSchedules(schedules)
      }
    }
  }

  const handleDeleteSchedule = async (scheduleId) => {
    if (!activeSheetId) return;
    
    const schedule = schedules.find((s) => s.id === scheduleId)
    if (!schedule || !schedule.rowIndex) return

    // Optimistic update
    setSchedules(schedules.filter((s) => s.id !== scheduleId))

    try {
      const sheetId = activeSheetId
      await deleteRecitalEvent(sheetId, schedule.rowIndex, currentRecitalId)
    } catch (error) {
      console.error('Failed to delete recital event from Google Sheets', error)
      alert('Failed to delete recital event from Google Sheets. Please check your connection.')
      // Revert on error
      setSchedules(schedules)
    }
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (loading) {
    return (
      <div className={`App ${theaterMode ? 'theater-mode' : ''}`}>
        <DashboardSkeleton />
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading Recital Planner...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`App ${theaterMode ? 'theater-mode' : ''}`}>
        <div className="error-container">
          <h2>❌ Error Loading Data</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    )
  }

  // --- Header with Recital Switcher ---
  return (
    <div className={`App ${theaterMode ? 'theater-mode' : ''}`}>
      <div className="app-header-controls flex justify-between items-center p-4 bg-white shadow-sm mb-4">
        <h1 className="text-xl font-bold m-0">Recital Planner</h1>
        <div className="flex gap-3 items-center">
            <select 
              value={activeSheetId} 
              onChange={(e) => setActiveSheetId(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 bg-white text-sm"
            >
              <option value="" disabled>Select Recital Sheet...</option>
              {recitalConfigs.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button 
                onClick={() => setCurrentView(currentView === 'settings' ? 'dashboard' : 'settings')}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
                title="Settings"
            >
               {currentView === 'settings' ? 'Back to Dashboard' : '⚙️ Settings'}
            </button>
            <button onClick={() => setTheaterMode(!theaterMode)} className="px-3 py-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded text-sm font-medium transition-colors">
                {theaterMode ? 'Exit Theater Mode' : 'Theater Mode'}
            </button>
            <button onClick={() => {
              signOut(); 
              sessionStorage.removeItem('app_user');
              setUser(null);
            }} className="text-sm text-red-500 hover:text-red-700 font-medium ml-2">
            Sign Out
            </button>
            {/* Old view switcher items can be merged or removed if redundant */}
        </div>
      </div>

    {/* View Router */}
    {currentView === 'settings' ? (
         <Settings onConfigsChange={updateRecitalConfigs} initialConfigs={recitalConfigs} />
    ) : currentView === 'checkin' ? (
        <>
            <div className="mb-4 px-4">
             <button onClick={() => setCurrentView('dashboard')} className="text-sm text-blue-600 hover:underline">← Back to Dashboard</button>
            </div>
            <BackstageCheckIn
            dancers={dancers.filter((d) => d.recitalId === currentRecitalId || !d.recitalId)}
            onUpdateStatus={handleUpdateCheckInStatus}
            theaterMode={theaterMode}
            />
        </>
    ) : (
        // Dashboard View
        <>
        <div className="view-switcher px-4 mb-4 hidden"> {/* Hiding old switcher but keeping logic if needed */}
             {/* ... */}
        </div>
        
        <div className="dashboard-wrapper px-4">
            <div className="flex justify-end mb-4">
                 <button onClick={() => setShowQRGenerator(true)} className="qr-generate-btn mr-4">
                Generate QR Codes
                </button>
                 <button
                    className="checkin-nav-btn"
                    onClick={() => setCurrentView('checkin')}
                    style={{
                   // ... styles ...
                    }}
                >
                    Launch Backstage Check-In
                </button>
            </div>

            <RecitalPlannerDashboard
            dancers={dancers}
            conflicts={conflicts}
            onAddDancer={handleAddDancer}
            onUpdateDancer={handleUpdateDancer}
            schedules={schedules}
            onAddSchedule={handleAddSchedule}
            onUpdateSchedule={handleUpdateSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            recitals={recitals}
            currentRecitalId={currentRecitalId}
            onRecitalChange={setCurrentRecitalId}
            onNavigateToCheckIn={() => setCurrentView('checkin')}
            onManualRefresh={() => syncAll(currentRecitalId)}
            lastSync={lastSync}
            />
        </div>
        </>
      )}

      {showQRGenerator && (
        <QRCodeGenerator dancers={dancers} onClose={() => setShowQRGenerator(false)} />
      )}
    </div>
  )
}

export default App
