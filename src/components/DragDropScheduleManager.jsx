import React, { useState, useCallback, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import LoadingSkeleton from './LoadingSkeleton';

// Drag-and-Drop Item Types
const ItemTypes = {
  DANCER: 'dancer',
  SCHEDULE: 'schedule'
};

// Draggable Dancer Component
const DraggableDancer = ({ dancer, onDrop, isAssigned, conflicts, onConflictClick }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.DANCER,
    item: { id: dancer.id, name: dancer.name },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  });

  // Check if this dancer has conflicts
  const hasConflicts = conflicts.some(conflict => conflict.dancerId === dancer.id);
  const conflictCount = conflicts.filter(conflict => conflict.dancerId === dancer.id).length;

  const handleClick = (e) => {
    if (hasConflicts && onConflictClick) {
      e.stopPropagation();
      onConflictClick(dancer.id);
    }
  };

  return (
    <div
      ref={drag}
      className={`draggable-dancer bg-white p-3 mb-2 rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-all flex justify-between items-center ${isDragging ? 'opacity-50' : 'opacity-100'} ${isAssigned ? 'bg-green-50 border-green-200' : ''} ${hasConflicts ? 'bg-red-50 border-red-200' : ''}`}
      onClick={handleClick}
    >
      <div className="dancer-info flex flex-col">
        <span className="dancer-name font-medium text-gray-800">{dancer.name}</span>
        {dancer.role && <span className="dancer-role text-xs text-gray-500">{dancer.role}</span>}
      </div>
        {hasConflicts && (
          <span className="conflict-badge bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold" title={`This dancer has ${conflictCount} scheduling conflict${conflictCount > 1 ? 's' : ''}`}>
            ⚠️ {conflictCount}
          </span>
        )}
    </div>
  );
};

// Droppable Schedule Slot Component
const DroppableScheduleSlot = ({ schedule, dancers, onAssignDancer, onRemoveDancer, onUpdateSchedule }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.DANCER,
    drop: (item) => onAssignDancer(schedule.id, item.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    })
  });

  const handleTimeChange = (e) => {
    onUpdateSchedule(schedule.id, { ...schedule, time: e.target.value });
  };

  const assignedDancers = schedule.assignedDancers.map(id => 
    dancers.find(d => String(d.id) === String(id))
  ).filter(Boolean);

  return (
    <div
      ref={drop}
      className={`schedule-slot bg-white p-4 rounded-lg border-2 transition-colors min-h-[150px] flex flex-col ${isOver ? 'border-primary bg-green-50' : 'border-gray-200'} ${canDrop ? 'border-dashed' : ''}`}
    >
      <div className="schedule-header flex justify-between items-start mb-3 pb-2 border-b border-gray-100">
        <div>
          <h4 className="font-bold text-gray-800 m-0">{schedule.title}</h4>
          <span className="text-xs text-gray-500">{schedule.date} </span>
        </div>
        <input
          type="time"
          value={schedule.time || ''}
          onChange={handleTimeChange}
          className="time-input text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-primary"
        />
      </div>
      <div className="assigned-dancers flex-1 flex flex-col gap-2">
        {assignedDancers.length > 0 ? (
          assignedDancers.map(dancer => (
            <div key={`assigned-${dancer.id}`} className="assigned-dancer bg-gray-50 p-2 rounded border border-gray-200 text-sm flex justify-between items-center group">
              <span className="font-medium text-gray-700">{dancer.name}</span>
              <button 
                onClick={() => onRemoveDancer(schedule.id, dancer.id)}
                className="remove-btn text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))
        ) : (
          <div className="empty-slot text-gray-400 text-sm italic text-center py-4 border-2 border-dashed border-gray-100 rounded">Drop dancers here</div>
        )}
      </div>
    </div>
  );
};

// Draggable Schedule Component for reordering
const DraggableSchedule = ({ schedule, index, moveSchedule, children }) => {
  const ref = React.useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.SCHEDULE,
    item: { id: schedule.id, index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: ItemTypes.SCHEDULE,
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveSchedule(dragIndex, hoverIndex);
      item.index = hoverIndex;
    }
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="draggable-schedule-container"
    >
      {children}
    </div>
  );
};

const DragDropScheduleManager = ({ schedules, onAddSchedule, dancers, conflicts: externalConflicts, loading = false }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [localSchedules, setLocalSchedules] = useState(schedules);
  const [localConflicts, setLocalConflicts] = useState(externalConflicts || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Get unique roles for filter dropdown
  const uniqueRoles = React.useMemo(() => {
    const roles = new Set(dancers.map(dancer => dancer.role).filter(Boolean));
    return ['all', ...Array.from(roles)];
  }, [dancers]);

  // Filter and sort dancers
  const filteredAndSortedDancers = React.useMemo(() => {
    return dancers
      .filter(dancer => {
        // Search filter
        const matchesSearch = searchTerm === '' ||
          dancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (dancer.class && dancer.class.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (dancer.role && dancer.role.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Role filter
        const matchesRole = filterRole === 'all' || dancer.role === filterRole;
        
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else if (sortBy === 'class') {
          return (a.class || '').localeCompare(b.class || '');
        } else if (sortBy === 'role') {
          return (a.role || '').localeCompare(b.role || '');
        }
        return 0;
      });
  }, [dancers, searchTerm, filterRole, sortBy]);

  if (loading) {
    return (
      <div className="schedule-loading">
        <LoadingSkeleton type="text" width="250px" height="32px" count={1} gap="20px" />
        
        <div className="schedule-container">
          <div className="dancers-panel">
            <LoadingSkeleton type="text" width="150px" height="24px" count={1} gap="15px" />
            <LoadingSkeleton type="rect" width="100%" height="300px" count={1} gap="15px" />
          </div>
          
          <div className="schedule-timeline">
            <LoadingSkeleton type="text" width="150px" height="24px" count={1} gap="15px" />
            <LoadingSkeleton type="rect" width="100%" height="100px" count={2} gap="15px" />
          </div>
          
          <div className="conflicts-panel">
            <LoadingSkeleton type="text" width="150px" height="24px" count={1} gap="15px" />
            <LoadingSkeleton type="rect" width="100%" height="80px" count={3} gap="10px" />
          </div>
        </div>
        
        <LoadingSkeleton type="rect" width="100%" height="80px" count={1} gap="20px" />
      </div>
    );
  }

  // Sync local state with props
  React.useEffect(() => {
    setLocalSchedules(schedules);
  }, [schedules]);

  React.useEffect(() => {
    setLocalConflicts(externalConflicts || []);
  }, [externalConflicts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title && date) {
      const newSchedule = { 
        title, 
        date, 
        time, 
        assignedDancers: [],
        id: Date.now() 
      };
      const updatedSchedules = [...localSchedules, newSchedule];
      setLocalSchedules(updatedSchedules);
      onAddSchedule(newSchedule);
      setTitle('');
      setDate('');
      setTime('');
    }
  };

  const assignDancerToSchedule = useCallback((scheduleId, dancerId) => {
    setLocalSchedules(prevSchedules => 
      prevSchedules.map(schedule => 
        schedule.id === scheduleId 
          ? {
              ...schedule,
              assignedDancers: [...schedule.assignedDancers, dancerId]
            }
          : schedule
      )
    );
  }, []);

  const removeDancerFromSchedule = useCallback((scheduleId, dancerId) => {
    setLocalSchedules(prevSchedules => 
      prevSchedules.map(schedule => 
        schedule.id === scheduleId
          ? {
              ...schedule,
              assignedDancers: schedule.assignedDancers.filter(id => String(id) !== String(dancerId))
            }
          : schedule
      )
    );
  }, []);

  const updateSchedule = useCallback((scheduleId, updates) => {
    setLocalSchedules(prevSchedules => 
      prevSchedules.map(schedule => 
        schedule.id === scheduleId ? { ...schedule, ...updates } : schedule
      )
    );
  }, []);

  const moveSchedule = useCallback((dragIndex, hoverIndex) => {
    setLocalSchedules(prevSchedules => {
      const newSchedules = [...prevSchedules];
      const [removed] = newSchedules.splice(dragIndex, 1);
      newSchedules.splice(hoverIndex, 0, removed);
      return newSchedules;
    });
  }, []);

  const getDancerAssignments = (dancerId) => {
    return localSchedules.filter(schedule => 
      schedule.assignedDancers.some(id => String(id) === String(dancerId))
    );
  };

  const isDancerAssigned = (dancerId) => {
    return localSchedules.some(schedule => 
      schedule.assignedDancers.some(id => String(id) === String(dancerId))
    );
  };

  // Conflict detection function
  const detectConflicts = useCallback((schedulesToCheck) => {
    const conflicts = [];

    // Sort schedules by date and time to ensure correct order
    const sortedSchedules = [...schedulesToCheck].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
      const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
      return dateA - dateB;
    });

    // Iterate through schedules to find consecutive appearances
    for (let i = 0; i < sortedSchedules.length - 1; i++) {
      const currentEvent = sortedSchedules[i];
      const nextEvent = sortedSchedules[i + 1];

      // Check for overlapping dancers
      const currentDancers = currentEvent.assignedDancers || [];
      const nextDancers = nextEvent.assignedDancers || [];

      const commonDancers = currentDancers.filter(dancerId => nextDancers.includes(dancerId));

      commonDancers.forEach(dancerId => {
        const dancer = dancers.find(d => String(d.id) === String(dancerId));
        const dancerName = dancer ? dancer.name : 'Unknown Dancer';
        
        conflicts.push({
          id: `${dancerId}-${currentEvent.id}-${nextEvent.id}`,
          dancerId,
          description: `Quick Change: ${dancerName} is in "${currentEvent.title}" and "${nextEvent.title}" (Consecutive)`,
          severity: 'high'
        });
      });
    }

    return conflicts;
  }, [dancers]);

  // Update conflicts whenever schedules change
  useEffect(() => {
    const newConflicts = detectConflicts(localSchedules);
    setLocalConflicts(newConflicts);
  }, [localSchedules, detectConflicts]);

  return (
    <div className="drag-drop-schedule-manager bg-background rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
      <h3 className="text-xl font-bold text-text mb-6 flex items-center gap-2">📅 Drag & Drop Recital Scheduler</h3>

      <div className="schedule-controls mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <form onSubmit={handleSubmit} className="add-schedule-form flex gap-4 flex-wrap items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-gray-500 mb-1">Event Title</label>
            <input
              type="text"
              placeholder="e.g. Act 1 Scene 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary bg-white"
            />
          </div>
          <div className="w-40">
            <label className="block text-xs font-bold text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary bg-white"
            />
          </div>
          <div className="w-32">
            <label className="block text-xs font-bold text-gray-500 mb-1">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary bg-white"
            />
          </div>
          <button type="submit" className="bg-primary hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold h-[42px] transition-colors">Add Event</button>
        </form>
      </div>

      <div className="schedule-container grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="dancers-panel bg-gray-50 p-4 rounded-lg border border-gray-200 h-[600px] flex flex-col">
            <div className="dancers-header mb-4">
              <h4 className="font-bold text-gray-700 mb-3">👥 Available Dancers</h4>
              <div className="dancers-controls flex flex-col gap-2">
                <div className="search-filter">
                  <input
                    type="text"
                    placeholder="🔍 Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="dancer-search w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="filter-role flex-1">
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="role-filter w-full px-2 py-2 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:border-primary"
                    >
                      {uniqueRoles.map(role => (
                        <option key={role} value={role}>
                          {role === 'all' ? 'All Roles' : role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sort-by flex-1">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="sort-select w-full px-2 py-2 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:border-primary"
                    >
                      <option value="name">Sort: Name</option>
                      <option value="class">Sort: Class</option>
                      <option value="role">Sort: Role</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="dancer-stats text-xs text-gray-500 mt-2 flex justify-between items-center">
                <span>{filteredAndSortedDancers.length} / {dancers.length}</span>
                {searchTerm && <span className="search-badge bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Filtered</span>}
              </div>
            </div>
            <div className="dancers-list overflow-y-auto flex-1 pr-1">
              {filteredAndSortedDancers.length === 0 ? (
                <div className="no-dancers-found text-center py-8 text-gray-500">
                  <p className="mb-2">No dancers match.</p>
                  <button onClick={() => {
                    setSearchTerm('');
                    setFilterRole('all');
                  }} className="clear-filters-btn text-primary hover:underline text-sm">
                    Clear Filters
                  </button>
                </div>
              ) : (
                filteredAndSortedDancers.map(dancer => (
                  <DraggableDancer
                    key={`dancer-${dancer.id}`}
                    dancer={dancer}
                    isAssigned={isDancerAssigned(dancer.id)}
                    conflicts={localConflicts}
                    onConflictClick={(dancerId) => {
                      const dancerConflicts = localConflicts.filter(c => c.dancerId === dancerId);
                      alert(`Conflicts for ${dancer.name}:\n\n${dancerConflicts.map(c => `- ${c.description}`).join('\n')}`);
                    }}
                  />
                ))
              )}
            </div>
          </div>

          <div className="schedule-timeline col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[600px] flex flex-col">
            <h4 className="font-bold text-gray-700 mb-4">Recital Timeline</h4>
            <div className="timeline-content overflow-y-auto flex-1 pr-2 space-y-4">
            {localSchedules.length === 0 ? (
              <div className="empty-timeline text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                <p>No events scheduled yet. Add an event to get started!</p>
              </div>
            ) : (
              localSchedules.map((schedule, index) => (
                <DraggableSchedule
                  key={schedule.id}
                  index={index}
                  schedule={schedule}
                  moveSchedule={moveSchedule}
                >
                  <DroppableScheduleSlot
                    schedule={schedule}
                    dancers={dancers}
                    onAssignDancer={assignDancerToSchedule}
                    onRemoveDancer={removeDancerFromSchedule}
                    onUpdateSchedule={updateSchedule}
                  />
                </DraggableSchedule>
              ))
            )}
            </div>
          </div>

          <div className="conflicts-panel col-span-1 lg:col-span-3 bg-red-50 p-4 rounded-lg border border-red-100 mt-6">
            <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">⚠️ Scheduling Conflicts ({localConflicts.length})</h4>
            {localConflicts.length === 0 ? (
              <div className="no-conflicts text-green-600 font-medium flex items-center gap-2">
                <span>✅</span> No conflicts detected. Great job!
              </div>
            ) : (
              <ul className="conflicts-list space-y-2 max-h-[200px] overflow-y-auto">
                {localConflicts.map((conflict, index) => (
                  <li 
                    key={`conflict-${index}`} 
                    className={`conflict-item p-3 rounded bg-white border border-red-100 shadow-sm flex items-start gap-3`}
                  >
                    <span className="conflict-severity text-lg">
                      {conflict.severity === 'high' ? '🔴' : conflict.severity === 'medium' ? '🟡' : '🟢'}
                    </span>
                    <span className="conflict-description text-sm text-gray-700">
                      {conflict.description}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
      </div>

      <div className="schedule-summary mt-6 pt-4 border-t border-gray-200 flex gap-6 text-sm text-gray-600">
        <div className="font-semibold text-gray-800">📊 Schedule Summary</div>
        <div>Total Events: <span className="font-bold">{localSchedules.length}</span></div>
        <div>Total Dancers: <span className="font-bold">{dancers.length}</span></div>
        <div>Assigned Dancers: <span className="font-bold">{localSchedules.reduce((sum, schedule) => sum + schedule.assignedDancers.length, 0)}</span></div>
      </div>
    </div>
  );
};

export default DragDropScheduleManager;