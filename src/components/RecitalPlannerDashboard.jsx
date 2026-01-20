import React, { useState } from 'react'
import MeasurementDashboard from './MeasurementDashboard'
import DragDropScheduleManager from './DragDropScheduleManager'
import LoadingSkeleton from './LoadingSkeleton'

const RecitalPlannerDashboard = ({
  dancers,
  conflicts,
  onAddDancer,
  onUpdateDancer,
  schedules,
  onAddSchedule,
  loading = false,
  recitals = [],
  currentRecitalId,
  onRecitalChange,
  onNavigateToCheckIn,
}) => {
  const [newDancer, setNewDancer] = useState({ name: '', role: '' })

  // Use prop if available, otherwise default to 'recital-1' (for backward compatibility or if not passed)
  const activeRecitalId = currentRecitalId || 'recital-1'

  // Helper to get dancer count for a recital
  const getDancerCount = (recitalId) => {
    return dancers.filter(
      (dancer) => dancer.recitalId === recitalId || (!dancer.recitalId && recitalId === 'recital-1')
    ).length
  }

  // Filter data by selected recital
  const currentDancers = dancers.filter(
    (dancer) =>
      dancer.recitalId === activeRecitalId || (!dancer.recitalId && activeRecitalId === 'recital-1')
  )

  // Schedules are already filtered by App.jsx fetching, but we filter again just in case mixed data is passed
  const currentSchedules = schedules.filter(
    (schedule) =>
      schedule.recitalId === activeRecitalId ||
      (!schedule.recitalId && activeRecitalId === 'recital-1')
  )

  const currentConflicts = conflicts.filter((conflict) =>
    currentDancers.some((dancer) => dancer.id === conflict.dancerId)
  )

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSkeleton type="text" width="30%" height="32px" count={1} gap="20px" />
        // ...existing code...
      </div>
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newDancer.name && newDancer.role) {
      onAddDancer(newDancer)
      setNewDancer({ name: '', role: '' })
    }
  }

  // Default recitals if none provided
  const displayRecitals =
    recitals.length > 0
      ? recitals
      : [
          { id: 'recital-1', name: 'Recital 1' },
          { id: 'recital-2', name: 'Recital 2' },
        ]

  return (
    <div className="recital-planner-dashboard">
      <h2>Recital Planner Dashboard</h2>
      <div className="recital-tabs-global">
        {displayRecitals.map((recital) => (
          <button
            key={recital.id}
            className={`recital-tab-global ${activeRecitalId === recital.id ? 'active' : ''}`}
            onClick={() => (onRecitalChange ? onRecitalChange(recital.id) : null)}
          >
            {recital.name} <span className="count-badge">{getDancerCount(recital.id)}</span>
          </button>
        ))}
      </div>
      <div className="dashboard-actions" style={{ marginBottom: '24px' }}>
        <button
          className="checkin-nav-btn"
          onClick={onNavigateToCheckIn}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            backgroundColor: '#2c3e50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          📋 Launch Backstage Check-In for{' '}
          {displayRecitals.find((r) => r.id === activeRecitalId)?.name || 'Selected Recital'}
        </button>
      </div>
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
          {currentDancers.map((dancer) => (
            <li key={dancer.id}>
              {dancer.name} - {dancer.role}
            </li>
          ))}
        </ul>
      </section>
      <MeasurementDashboard dancers={currentDancers} onUpdateDancer={onUpdateDancer} />
      <DragDropScheduleManager
        schedules={currentSchedules}
        onAddSchedule={onAddSchedule}
        dancers={currentDancers}
        conflicts={currentConflicts}
      />
      <section>
        <h3>Conflicts</h3>
        <ul>
          {currentConflicts.map((conflict) => (
            <li key={conflict.id}>{conflict.description}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default RecitalPlannerDashboard
