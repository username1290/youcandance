import React, { useState } from 'react'

const MeasurementDashboard = ({ dancers, onUpdateDancer }) => {
  const [editing, setEditing] = useState(null)
  const [editData, setEditData] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [expandedDancer, setExpandedDancer] = useState(null)

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

  const sortedDancers = [...filteredDancers].sort((a, b) => {
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
    <div className="measurement-dashboard bg-background rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
      <div className="dashboard-header flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-text flex items-center gap-2">
          📏 Measurement Dashboard
        </h3>
        <div className="dashboard-controls flex items-center gap-4">
          <input
            type="text"
            placeholder="🔍 Search dancers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary w-64 bg-background text-text"
          />
          <span className="dancer-count text-gray-500 bg-gray-100 px-3 py-1 rounded-md text-sm">
            {filteredDancers.length} of {dancers.length} dancers
          </span>
        </div>
      </div>

      <div className="measurements-table w-full border border-gray-200 rounded-lg overflow-hidden">
        <div className="table-header grid grid-cols-[2fr_1fr_2fr_0.5fr] bg-gray-50 p-3 font-semibold text-gray-700 border-b border-gray-200">
          <div
            className="header-cell name cursor-pointer flex items-center justify-between hover:bg-gray-200 rounded px-2"
            onClick={() => handleSort('name')}
          >
            Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </div>
          <div
            className="header-cell class cursor-pointer flex items-center justify-between hover:bg-gray-200 rounded px-2"
            onClick={() => handleSort('class')}
          >
            Class {sortConfig.key === 'class' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </div>
          <div className="header-cell measurements">Measurements</div>
          <div className="header-cell actions">Actions</div>
        </div>

        {sortedDancers.length === 0 ? (
          <div className="no-results p-8 text-center text-gray-500 italic">
            No dancers found matching your search.
          </div>
        ) : (
          sortedDancers.map((dancer) => (
            <div
              key={dancer.id}
              className={`dancer-row grid grid-cols-[2fr_1fr_2fr_0.5fr] p-3 border-b border-gray-100 items-center hover:bg-gray-50 transition-colors ${expandedDancer === dancer.id ? 'bg-blue-50' : ''}`}
            >
              <div
                className="dancer-cell name cursor-pointer"
                onClick={() => toggleExpand(dancer.id)}
              >
                <span className="dancer-name font-semibold text-text block">{dancer.name}</span>
                {dancer.class && (
                  <span className="dancer-class text-xs text-gray-500 block">{dancer.class}</span>
                )}
              </div>
              <div className="dancer-cell class text-sm text-gray-600">{dancer.class || '—'}</div>
              <div className="dancer-cell measurements" style={{ minWidth: '380px' }}>
                {editing === dancer.id ? (
                  <div className="edit-measurements flex gap-2 flex-wrap items-center h-[34px]">
                    <div className="measurement-input flex items-center gap-1">
                      <label className="text-xs font-bold text-gray-500 w-3">G:</label>
                      <input
                        type="number"
                        value={editData.girth || ''}
                        onChange={(e) => handleChange('girth', parseFloat(e.target.value) || 0)}
                        className="compact-input w-14 px-1 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="measurement-input flex items-center gap-1">
                      <label className="text-xs font-bold text-gray-500 w-3">C:</label>
                      <input
                        type="number"
                        value={editData.chest || ''}
                        onChange={(e) => handleChange('chest', parseFloat(e.target.value) || 0)}
                        className="compact-input w-14 px-1 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="measurement-input flex items-center gap-1">
                      <label className="text-xs font-bold text-gray-500 w-3">W:</label>
                      <input
                        type="number"
                        value={editData.waist || ''}
                        onChange={(e) => handleChange('waist', parseFloat(e.target.value) || 0)}
                        className="compact-input w-14 px-1 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="measurement-input flex items-center gap-1">
                      <label className="text-xs font-bold text-gray-500 w-3">H:</label>
                      <input
                        type="number"
                        value={editData.hips || ''}
                        onChange={(e) => handleChange('hips', parseFloat(e.target.value) || 0)}
                        className="compact-input w-14 px-1 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="measurement-display flex gap-2 flex-wrap items-center h-[34px]">
                    <span className="measurement-value bg-gray-100 px-2 py-1 rounded text-xs text-gray-700 w-[78px] text-center inline-block">
                      G: {dancer.girth || '—'}
                    </span>
                    <span className="measurement-value bg-gray-100 px-2 py-1 rounded text-xs text-gray-700 w-[78px] text-center inline-block">
                      C: {dancer.chest || '—'}
                    </span>
                    <span className="measurement-value bg-gray-100 px-2 py-1 rounded text-xs text-gray-700 w-[78px] text-center inline-block">
                      W: {dancer.waist || '—'}
                    </span>
                    <span className="measurement-value bg-gray-100 px-2 py-1 rounded text-xs text-gray-700 w-[78px] text-center inline-block">
                      H: {dancer.hips || '—'}
                    </span>
                  </div>
                )}
              </div>
              <div className="dancer-cell actions flex gap-2">
                {editing === dancer.id ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="save-btn !bg-green-600 hover:!bg-green-700 !text-white px-3 py-1 rounded text-sm font-bold shadow-sm transition-colors border-2 !border-green-700"
                    >
                      SAVE
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="cancel-btn !bg-red-500 hover:!bg-red-600 !text-white px-3 py-1 rounded text-sm font-bold shadow-sm transition-colors border-2 !border-red-700"
                    >
                      CANCEL
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEdit(dancer)}
                    className="edit-btn text-gray-400 hover:text-primary text-lg"
                  >
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
