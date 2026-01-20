import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { LoadingSkeleton, ListSkeleton } from './LoadingSkeleton';

const BackstageCheckIn = ({ dancers, onUpdateStatus, theaterMode, loading = false }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [scanSuccess, setScanSuccess] = useState(null);

  if (loading) {
    return (
      <div className="checkin-loading">
        <LoadingSkeleton type="text" width="200px" height="32px" count={1} gap="20px" />
        <LoadingSkeleton type="button" width="150px" height="40px" count={1} gap="20px" />
        <ListSkeleton items={3} />
      </div>
    );
  }

  const handleStatusChange = (dancerId, status) => {
    onUpdateStatus(dancerId, status);
  };

  const handleScan = (result) => {
    if (result) {
      try {
        // Enhanced error handling with more specific error messages
        if (!result.text) {
          throw new Error('No data in QR code');
        }

        let data;
        try {
          data = JSON.parse(result.text);
        } catch (e) {
          throw new Error('QR code does not contain valid JSON data');
        }

        if (!data || typeof data !== 'object') {
          throw new Error('Invalid data structure in QR code');
        }

        if (!data.dancerId) {
          throw new Error('QR code missing dancer ID');
        }

        // Find the dancer and update status
        const dancer = dancers.find(d => d.id === data.dancerId);
        if (!dancer) {
          throw new Error('Dancer not found in system');
        }

        // Check if dancer is already checked in
        if (dancer.checkInStatus === 'Dressed') {
          setScanSuccess(`Already checked in: ${dancer.name}`);
          setScanError(null);
          setShowScanner(false);
          return;
        }

        onUpdateStatus(data.dancerId, 'Dressed');
        setScanSuccess(`Successfully checked in ${dancer.name}`);
        setScanError(null);

      } catch (error) {
        console.error('QR Scan Error:', error);
        setScanError(error.message || 'Error processing QR code');
        // Auto-close scanner after error
        setTimeout(() => {
          setShowScanner(false);
        }, 2000);
      }
    }
  };

  const handleError = (error) => {
    console.error('Camera Error:', error);
    let errorMessage = 'Camera error: ';
    
    if (error.name === 'NotAllowedError') {
      errorMessage += 'Camera access denied. Please enable camera permissions.';
    } else if (error.name === 'NotFoundError') {
      errorMessage += 'No camera found on this device.';
    } else if (error.name === 'NotReadableError') {
      errorMessage += 'Camera is already in use by another application.';
    } else if (error.name === 'OverconstrainedError') {
      errorMessage += 'Camera constraints could not be satisfied.';
    } else {
      errorMessage += error.message || 'Unknown camera error.';
    }
    
    setScanError(errorMessage);
    // Auto-close scanner after camera error
    setTimeout(() => {
      setShowScanner(false);
    }, 3000);
  };

  return (
    <div className={`backstage-checkin ${theaterMode ? 'theater-mode' : ''}`}>
      <h2>Backstage Check-In</h2>
      <div className="qr-scan-controls">
        <button
          className="qr-scan-btn"
          onClick={() => {
            setShowScanner(true);
            setScanError(null);
            setScanSuccess(null);
          }}
        >
          Scan QR Code
        </button>
        {scanSuccess && <div className="scan-success">{scanSuccess}</div>}
        {scanError && <div className="scan-error">{scanError}</div>}
      </div>
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
      {showScanner && (
        <div className="qr-scanner-modal">
          <div className="qr-scanner-container">
            <QrReader
              onResult={handleScan}
              onError={handleError}
              constraints={{ facingMode: 'environment' }}
              containerStyle={{ width: '100%' }}
            />
            <button
              className="close-scanner-btn"
              onClick={() => setShowScanner(false)}
            >
              Close Scanner
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackstageCheckIn;