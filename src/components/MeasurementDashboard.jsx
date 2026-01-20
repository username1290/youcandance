import React, { useState } from 'react'

const MeasurementDashboard = ({ dancers, onUpdateDancer }) => {
  const [editing, setEditing] = useState(null)
  const [editData, setEditData] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [expandedDancer, setExpandedDancer] = useState(null)
  const [activeRecital, setActiveRecital] = useState('recital-1')

  const handleEdit = (dancer) => {
    setEditing(dancer.id)
    setEditData({ ...dancer })
    setExpandedDancer(dancer.id)
  }

  const handleSave = () => {
    onUpdateDancer(editData)
    setEditing(null)
  }

  const handleChange = (field, value) => {
    setEditData({ ...editData, [field]: value })
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const toggleExpand = (dancerId) => {
    setExpandedDancer(expandedDancer === dancerId ? null : dancerId)
  }

  const filteredDancers = dancers.filter(
    (dancer) =>
      dancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dancer.class && dancer.class.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const recital1Dancers = filteredDancers.filter((dancer) => dancer.recitalId === 'recital-1')
  const recital2Dancers = filteredDancers.filter((dancer) => dancer.recitalId === 'recital-2')
  const currentDancers = activeRecital === 'recital-1' ? recital1Dancers : recital2Dancers

  const sortedDancers = [...currentDancers].sort((a, b) => {
    if (!sortConfig.key) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  return (
    <div className="measurement-dashboard">
      <div className="dashboard-header">
        <h3>📏 Measurement Dashboard</h3>
        <div className="dashboard-controls">
          <input
            type="text"
            placeholder="🔍 Search dancers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="dancer-count">
            {currentDancers.length} of {filteredDancers.length} dancers
          </span>
        </div>
      </div>
      <div className="recital-tabs">
        <button
          className={`recital-tab ${activeRecital === 'recital-1' ? 'active' : ''}`}
          onClick={() => setActiveRecital('recital-1')}
        >
          Recital 1 ({recital1Dancers.length})
        </button>
        <button
          className={`recital-tab ${activeRecital === 'recital-2' ? 'active' : ''}`}
          onClick={() => setActiveRecital('recital-2')}
        >
          Recital 2 ({recital2Dancers.length})
        </button>
      </div>

      <div className="measurements-table">
        <div className="table-header">
          <div className="header-cell name" onClick={() => handleSort('name')}>
            Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </div>
          <div className="header-cell class" onClick={() => handleSort('class')}>
            Class {sortConfig.key === 'class' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </div>
          <div className="header-cell measurements">Measurements</div>
          <div className="header-cell actions">Actions</div>
        </div>

        {sortedDancers.length === 0 ? (
          <div className="no-results">No dancers found matching your search.</div>
        ) : (
          sortedDancers.map((dancer) => (
            <div
              key={dancer.id}
              className={`dancer-row ${expandedDancer === dancer.id ? 'expanded' : ''}`}
            >
              <div className="dancer-cell name" onClick={() => toggleExpand(dancer.id)}>
                <span className="dancer-name">{dancer.name}</span>
                {dancer.class && <span className="dancer-class">{dancer.class}</span>}
              </div>
              <div className="dancer-cell class">{dancer.class || '—'}</div>
              <div className="dancer-cell measurements">
                {editing === dancer.id ? (
                  <div className="edit-measurements">
                    <div className="measurement-input">
                      <label>G:</label>
                      <input
                        type="number"
                        value={editData.girth || ''}
                        onChange={(e) => handleChange('girth', parseFloat(e.target.value) || 0)}
                        className="compact-input"
                      />
                    </div>
                    <div className="measurement-input">
                      <label>C:</label>
                      <input
                        type="number"
                        value={editData.chest || ''}
                        onChange={(e) => handleChange('chest', parseFloat(e.target.value) || 0)}
                        className="compact-input"
                      />
                    </div>
                    <div className="measurement-input">
                      <label>W:</label>
                      <input
                        type="number"
                        value={editData.waist || ''}
                        onChange={(e) => handleChange('waist', parseFloat(e.target.value) || 0)}
                        className="compact-input"
                      />
                    </div>
                    <div className="measurement-input">
                      <label>H:</label>
                      <input
                        type="number"
                        value={editData.hips || ''}
                        onChange={(e) => handleChange('hips', parseFloat(e.target.value) || 0)}
                        className="compact-input"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="measurement-display">
                    <span className="measurement-value">G: {dancer.girth || '—'}</span>
                    <span className="measurement-value">C: {dancer.chest || '—'}</span>
                    <span className="measurement-value">W: {dancer.waist || '—'}</span>
                    <span className="measurement-value">H: {dancer.hips || '—'}</span>
                  </div>
                )}
              </div>
              <div className="dancer-cell actions">
                {editing === dancer.id ? (
                  <>
                    <button onClick={handleSave} className="save-btn">
                      ✓
                    </button>
                    <button onClick={() => setEditing(null)} className="cancel-btn">
                      ✕
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleEdit(dancer)} className="edit-btn">
                    ✏️
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MeasurementDashboard
