import React, { useState, useEffect } from 'react'
import RecitalPlannerDashboard from './components/RecitalPlannerDashboard'
import BackstageCheckIn from './components/BackstageCheckIn'
import QRCodeGenerator from './components/QRCodeGenerator'
import LoadingSkeleton, { DashboardSkeleton } from './components/LoadingSkeleton'
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
  const [dancers, setDancers] = useState([])
  const [conflicts, setConflicts] = useState([])
  const [schedules, setSchedules] = useState([])
  const [recitals, setRecitals] = useState([])
  const [currentRecitalId, setCurrentRecitalId] = useState(null)
  const [theaterMode, setTheaterMode] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard')
  const [showQRGenerator, setShowQRGenerator] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Load data from Google Sheets with loading states
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Simulate loading delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 500))

        const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID || 'sheetId'

        // Load recitals metadata first
        const recitalsData = await fetchAllRecitals(sheetId)
        setRecitals(recitalsData)

        // Set first active recital as default, or first recital if none active
        if (recitalsData.length > 0) {
          const firstActive = recitalsData.find((r) => r.active) || recitalsData[0]
          setCurrentRecitalId(firstActive.id)
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
          } catch (error) {
            console.error('Failed to create default recital:', error)
            // Fallback to using default data without saving to Google Sheets
            setRecitals([defaultRecital])
            setCurrentRecitalId('recital-1')
          }
        }

        // Load dancers from Sheet1
        const dancersData = await fetchSheetData(sheetId)
        setDancers(dancersData)

        // Load recital events for the current recital
        if (currentRecitalId) {
          const eventsData = await fetchRecitalEvents(sheetId, currentRecitalId)
          setSchedules(eventsData)
        }
      } catch (err) {
        console.error('Failed to load data:', err)
        setError('Failed to load data. Please check your connection and try again.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Re-run conflict detection when dancers or schedules change
  useEffect(() => {
    if (dancers.length > 0 && schedules.length > 0) {
      const newConflicts = detectConflicts(schedules, dancers)
      setConflicts(newConflicts)
    }
  }, [dancers, schedules, currentRecitalId])

  // Reload schedules when current recital changes
  useEffect(() => {
    if (currentRecitalId) {
      const loadRecitalSchedules = async () => {
        try {
          const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID
          const eventsData = await fetchRecitalEvents(sheetId, currentRecitalId)
          setSchedules(eventsData)
        } catch (error) {
          console.error('Failed to load recital schedules:', error)
          if (error.message.includes('400')) {
            alert(
              'Recital events sheet not found. It will be created when you add your first event.'
            )
          } else {
            alert('Failed to load schedules for this recital. Please check your connection.')
          }
        }
      }
      loadRecitalSchedules()
    }
  }, [currentRecitalId])

  const handleAddDancer = (newDancer) => {
    const dancer = { ...newDancer, id: Date.now() } // Simple ID generation
    setDancers([...dancers, dancer])
    // In real app, save to Google Sheets
  }

  const handleUpdateDancer = async (updatedDancer) => {
    // Optimistic update
    setDancers(dancers.map((d) => (d.id === updatedDancer.id ? updatedDancer : d)))

    if (updatedDancer.rowIndex) {
      try {
        await updateDancerMeasurements(updatedDancer.rowIndex, {
          girth: updatedDancer.girth,
          chest: updatedDancer.chest,
          waist: updatedDancer.waist,
          hips: updatedDancer.hips,
        })
      } catch (error) {
        console.error('Failed to sync measurements to Google Sheets', error)
        alert('Failed to save measurements to Google Sheets. Please check your connection.')
      }
    }
  }

  const handleUpdateCheckInStatus = async (dancerId, status) => {
    // Optimistic update
    setDancers(dancers.map((d) => (d.id === dancerId ? { ...d, checkInStatus: status } : d)))

    const dancer = dancers.find((d) => d.id === dancerId)
    if (dancer && dancer.rowIndex) {
      try {
        await updateDancerStatus(dancer.rowIndex, status)
      } catch (error) {
        console.error('Failed to sync status to Google Sheets', error)
        alert('Failed to save status to Google Sheets. Please check your connection.')
      }
    }
  }

  const handleAddSchedule = async (newSchedule) => {
    // Optimistic update
    setSchedules([...schedules, newSchedule])

    try {
      const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID
      await saveRecitalEvent(sheetId, newSchedule, currentRecitalId)
    } catch (error) {
      console.error('Failed to sync recital event to Google Sheets', error)
      alert('Failed to save recital event to Google Sheets. Please check your connection.')
      // Revert on error
      setSchedules(schedules)
    }
  }

  const handleUpdateSchedule = async (updatedSchedule) => {
    // Optimistic update
    setSchedules(schedules.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s)))

    if (updatedSchedule.rowIndex) {
      try {
        const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID
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
    const schedule = schedules.find((s) => s.id === scheduleId)
    if (!schedule || !schedule.rowIndex) return

    // Optimistic update
    setSchedules(schedules.filter((s) => s.id !== scheduleId))

    try {
      const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID
      await deleteRecitalEvent(sheetId, schedule.rowIndex, currentRecitalId)
    } catch (error) {
      console.error('Failed to delete recital event from Google Sheets', error)
      alert('Failed to delete recital event from Google Sheets. Please check your connection.')
      // Revert on error
      setSchedules(schedules)
    }
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

  return (
    <div className={`App ${theaterMode ? 'theater-mode' : ''}`}>
      <button onClick={() => setTheaterMode(!theaterMode)} className="toggle-theater">
        {theaterMode ? 'Exit Theater Mode' : 'Enter Theater Mode'}
      </button>

      <div className="view-switcher">
        <button onClick={() => setCurrentView('dashboard')}>Dashboard</button>
        <button onClick={() => setCurrentView('checkin')}>Backstage Check-In</button>
        <button onClick={() => setShowQRGenerator(true)} className="qr-generate-btn">
          Generate QR Codes
        </button>
        <button onClick={signOut} className="sign-out-btn">
          Sign Out
        </button>
      </div>
      <h1>Recital Planner MVP</h1>
      {currentView === 'dashboard' ? (
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
        />
      ) : (
        <BackstageCheckIn
          dancers={dancers}
          onUpdateStatus={handleUpdateCheckInStatus}
          theaterMode={theaterMode}
        />
      )}

      {showQRGenerator && (
        <QRCodeGenerator dancers={dancers} onClose={() => setShowQRGenerator(false)} />
      )}
    </div>
  )
}

export default App
