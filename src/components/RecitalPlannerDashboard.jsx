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
}) => {
  const [newDancer, setNewDancer] = useState({ name: '', role: '' })
  const [selectedRecital, setSelectedRecital] = useState('recital-1')

  // Filter data by selected recital
  const recital1Dancers = dancers.filter(
    (dancer) => dancer.recitalId === 'recital-1' || !dancer.recitalId
  )
  const recital2Dancers = dancers.filter((dancer) => dancer.recitalId === 'recital-2')
  const currentDancers = selectedRecital === 'recital-1' ? recital1Dancers : recital2Dancers

  const recital1Schedules = schedules.filter(
    (schedule) => schedule.recitalId === 'recital-1' || !schedule.recitalId
  )
  const recital2Schedules = schedules.filter((schedule) => schedule.recitalId === 'recital-2')
  const currentSchedules = selectedRecital === 'recital-1' ? recital1Schedules : recital2Schedules

  const recital1Conflicts = conflicts.filter((conflict) =>
    currentDancers.some((dancer) => dancer.id === conflict.dancerId)
  )
  const recital2Conflicts = conflicts.filter((conflict) =>
    currentDancers.some((dancer) => dancer.id === conflict.dancerId)
  )
  const currentConflicts = selectedRecital === 'recital-1' ? recital1Conflicts : recital2Conflicts

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
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newDancer.name && newDancer.role) {
      onAddDancer(newDancer)
      setNewDancer({ name: '', role: '' })
    }
  }

  return (
    <div className="recital-planner-dashboard">
      <h2>Recital Planner Dashboard</h2>
      <div className="recital-selector">
        <label htmlFor="recital-select">Select Recital:</label>
        <select
          id="recital-select"
          value={selectedRecital}
          onChange={(e) => setSelectedRecital(e.target.value)}
          className="recital-dropdown"
        >
          <option value="recital-1">Recital 1 ({recital1Dancers.length} dancers)</option>
          <option value="recital-2">Recital 2 ({recital2Dancers.length} dancers)</option>
        </select>
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
