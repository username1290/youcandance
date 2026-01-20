import React, { useState, useCallback, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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
      className={`draggable-dancer ${isDragging ? 'dragging' : ''} ${isAssigned ? 'assigned' : ''} ${hasConflicts ? 'has-conflicts' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={handleClick}
    >
      <div className="dancer-info">
        <span className="dancer-name">{dancer.name}</span>
        {dancer.role && <span className="dancer-role">({dancer.role})</span>}
        {hasConflicts && (
          <span className="conflict-badge" title={`This dancer has ${conflictCount} scheduling conflict${conflictCount > 1 ? 's' : ''}`}>
            ⚠️ {conflictCount}
          </span>
        )}
      </div>
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
    dancers.find(d => d.id === id)
  ).filter(Boolean);

  return (
    <div
      ref={drop}
      className={`schedule-slot ${isOver ? 'over' : ''} ${canDrop ? 'can-drop' : ''}`}
    >
      <div className="schedule-header">
        <h4>{schedule.title}</h4>
        <span>{schedule.date} </span>
        <input
          type="time"
          value={schedule.time || ''}
          onChange={handleTimeChange}
          className="time-input"
        />
      </div>
      <div className="assigned-dancers">
        {assignedDancers.length > 0 ? (
          assignedDancers.map(dancer => (
            <div key={`assigned-${dancer.id}`} className="assigned-dancer">
              {dancer.name}
              <button 
                onClick={() => onRemoveDancer(schedule.id, dancer.id)}
                className="remove-btn"
              >
                ×
              </button>
            </div>
          ))
        ) : (
          <div className="empty-slot">Drop dancers here</div>
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
              assignedDancers: schedule.assignedDancers.filter(id => id !== dancerId)
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
      schedule.assignedDancers.includes(dancerId)
    );
  };

  const isDancerAssigned = (dancerId) => {
    return localSchedules.some(schedule => 
      schedule.assignedDancers.includes(dancerId)
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
        const dancer = dancers.find(d => d.id === dancerId);
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
    <div className="drag-drop-schedule-manager">
      <h3>📅 Drag & Drop Recital Scheduler</h3>

      <div className="schedule-controls">
        <form onSubmit={handleSubmit} className="add-schedule-form">
          <input
            type="text"
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <button type="submit">Add Event</button>
        </form>
      </div>

      <div className="schedule-container">
        <DndProvider backend={HTML5Backend}>
          <div className="dancers-panel">
            <h4>Available Dancers ({dancers.length})</h4>
            <div className="dancers-list">
              {dancers.map(dancer => (
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
              ))}
            </div>
          </div>

          <div className="schedule-timeline">
            <h4>Recital Timeline</h4>
            {localSchedules.length === 0 ? (
              <div className="empty-timeline">
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

          <div className="conflicts-panel">
            <h4>⚠️ Scheduling Conflicts ({localConflicts.length})</h4>
            {localConflicts.length === 0 ? (
              <div className="no-conflicts">
                <p>✅ No conflicts detected. Great job!</p>
              </div>
            ) : (
              <ul className="conflicts-list">
                {localConflicts.map((conflict, index) => (
                  <li 
                    key={`conflict-${index}`} 
                    className={`conflict-item conflict-${conflict.severity}`}
                  >
                    <span className="conflict-severity">
                      {conflict.severity === 'high' ? '🔴' : conflict.severity === 'medium' ? '🟡' : '🟢'}
                    </span>
                    <span className="conflict-description">
                      {conflict.description}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DndProvider>
      </div>

      <div className="schedule-summary">
        <h4>📊 Schedule Summary</h4>
        <p>Total Events: {localSchedules.length}</p>
        <p>Total Dancers: {dancers.length}</p>
        <p>Assigned Dancers: {localSchedules.reduce((sum, schedule) => sum + schedule.assignedDancers.length, 0)}</p>
      </div>
    </div>
  );
};

export default DragDropScheduleManager;