import React from 'react';

const BackstageCheckIn = ({ dancers, onUpdateStatus, theaterMode }) => {
  const handleStatusChange = (dancerId, status) => {
    onUpdateStatus(dancerId, status);
  };

  return (
    <div className={`backstage-checkin ${theaterMode ? 'theater-mode' : ''}`}>
      <h2>Backstage Check-In</h2>
      <div className="dancer-list">
        {dancers.map(dancer => (
          <div key={dancer.id} className="dancer-card">
            <h3>{dancer.name}</h3>
            <p>Role: {dancer.role}</p>
            <div className="status-buttons">
              <button
                className={`status-btn ${dancer.checkInStatus === 'Dressed' ? 'active' : ''}`}
                onClick={() => handleStatusChange(dancer.id, 'Dressed')}
              >
                Dressed
              </button>
              <button
                className={`status-btn ${dancer.checkInStatus === 'In Wings' ? 'active' : ''}`}
                onClick={() => handleStatusChange(dancer.id, 'In Wings')}
              >
                In Wings
              </button>
              <button
                className={`status-btn ${dancer.checkInStatus === 'Not Ready' ? 'active' : ''}`}
                onClick={() => handleStatusChange(dancer.id, 'Not Ready')}
              >
                Not Ready
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackstageCheckIn;