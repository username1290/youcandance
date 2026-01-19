export const detectConflicts = (schedules, dancers) => {
  const conflicts = [];

  // Sort schedules by date and time to ensure correct order
  const sortedSchedules = [...schedules].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
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
};