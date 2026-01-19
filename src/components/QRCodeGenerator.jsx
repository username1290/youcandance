import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';

const QRCodeGenerator = ({ dancers, onClose }) => {
  const [selectedDancer, setSelectedDancer] = useState(null);
  const [qrSize, setQrSize] = useState(200);
  const [includeLogo, setIncludeLogo] = useState(false);
  const qrRef = useRef(null);

  const handleDancerSelect = (dancerId) => {
    const dancer = dancers.find(d => d.id === dancerId);
    setSelectedDancer(dancer);
  };

  const generateQRData = (dancer) => {
    return JSON.stringify({
      dancerId: dancer.id,
      name: dancer.name,
      timestamp: new Date().toISOString()
    });
  };

  const downloadQRCode = async () => {
    if (!selectedDancer || !qrRef.current) return;

    try {
      // Get the QR code container element
      const qrContainer = qrRef.current;

      // Use html-to-image to capture the QR code as PNG
      const dataUrl = await toPng(qrContainer, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: 'white'
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `${selectedDancer.name.replace(/\s+/g, '_')}_QRCode.png`;
      link.href = dataUrl;
      link.click();

    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Error downloading QR code. Please try again.');
    }
  };

  const downloadAllQRCodes = async () => {
    if (dancers.length === 0) return;

    // Create a zip file would be better, but for simplicity we'll download individually
    for (const dancer of dancers) {
      setSelectedDancer(dancer);
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for UI to update
      await downloadQRCode();
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait between downloads
    }
  };

  return (
    <div className="qr-generator-modal">
      <div className="qr-generator-container">
        <h2>QR Code Generator</h2>
        
        <div className="qr-controls">
          <div className="dancer-selector">
            <label htmlFor="dancer-select">Select Dancer:</label>
            <select
              id="dancer-select"
              value={selectedDancer ? selectedDancer.id : ''}
              onChange={(e) => handleDancerSelect(e.target.value)}
            >
              <option value="">-- Select a dancer --</option>
              {dancers.map(dancer => (
                <option key={dancer.id} value={dancer.id}>
                  {dancer.name} ({dancer.id})
                </option>
              ))}
            </select>
          </div>

          {selectedDancer && (
            <div className="qr-options">
              <div className="size-control">
                <label>
                  Size: {qrSize}px
                  <input
                    type="range"
                    min="100"
                    max="500"
                    value={qrSize}
                    onChange={(e) => setQrSize(Number(e.target.value))}
                  />
                </label>
              </div>

              <div className="logo-option">
                <label>
                  <input
                    type="checkbox"
                    checked={includeLogo}
                    onChange={(e) => setIncludeLogo(e.target.checked)}
                  />
                  Include Logo
                </label>
              </div>

              <div className="qr-actions">
                <button onClick={downloadQRCode} className="download-btn">
                  Download QR Code
                </button>
                <button onClick={downloadAllQRCodes} className="download-all-btn">
                  Download All
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedDancer && (
          <div className="qr-preview">
            <div className="qr-code-container" ref={qrRef}>
              <QRCodeSVG
                value={generateQRData(selectedDancer)}
                size={qrSize}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="dancer-info">
              <h3>{selectedDancer.name}</h3>
              <p>ID: {selectedDancer.id}</p>
              <p>Scan this code for quick check-in</p>
            </div>
          </div>
        )}

        <button onClick={onClose} className="close-qr-generator">
          Close QR Generator
        </button>
      </div>
    </div>
  );
};

export default QRCodeGenerator;