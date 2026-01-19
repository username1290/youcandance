// Google Sheets integration using Google Sheets API v4
// Using Google Identity Services (GIS) for authentication

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || '';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const RANGE = 'Sheet1!A:K';

let tokenClient = null;
let accessToken = null;

// Load the Google API client library
const loadGapiClient = () => {
  return new Promise((resolve, reject) => {
    if (window.gapi && window.gapi.client) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
          });
          console.log('GAPI client initialized');
          resolve();
        } catch (error) {
          console.error('Error initializing GAPI client:', error);
          reject(error);
        }
      });
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Load Google Identity Services
const loadGis = () => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts) {
      initTokenClient();
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => {
      initTokenClient();
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const initTokenClient = () => {
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    callback: (response) => {
      if (response.error) {
        console.error('Token error:', response);
        return;
      }
      accessToken = response.access_token;
      console.log('Access token obtained');
    },
  });
  console.log('GIS initialized');
};

// Initialize both libraries
let initPromise = null;
const init = () => {
  if (!initPromise) {
    initPromise = Promise.all([loadGapiClient(), loadGis()]);
  }
  return initPromise;
};

// Start initialization immediately
init().catch(console.error);

export const authenticate = () => {
  return new Promise((resolve, reject) => {
    if (accessToken) {
      resolve(accessToken);
      return;
    }
    if (!tokenClient) {
      reject(new Error('Token client not initialized'));
      return;
    }
    // Override callback for this specific request
    tokenClient.callback = (response) => {
      if (response.error) {
        reject(response);
        return;
      }
      accessToken = response.access_token;
      resolve(accessToken);
    };
    tokenClient.requestAccessToken({ prompt: '' });
  });
};

export const signOut = () => {
  if (accessToken && window.google) {
    window.google.accounts.oauth2.revoke(accessToken, () => {
      console.log('Access token revoked');
      accessToken = null;
      window.location.reload();
    });
  } else {
    accessToken = null;
    window.location.reload();
  }
};

export const fetchSheetData = async (sheetId = SHEET_ID) => {
  try {
    await init();
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${RANGE}?key=${API_KEY}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch data from Google Sheets');
    }
    const data = await response.json();
    if (!data.values || data.values.length === 0) {
      return [];
    }
    const rows = data.values.slice(1);
    const dancers = rows.map((row, index) => {
      const sheetIdVal = parseInt(row[0]);
      const id = !isNaN(sheetIdVal) ? sheetIdVal : `dancer-${index}-${Date.now()}`;
      return {
        id,
        name: row[1] || '',
        girth: parseFloat(row[2]) || 0,
        chest: parseFloat(row[3]) || 0,
        waist: parseFloat(row[4]) || 0,
        hips: parseFloat(row[5]) || 0,
        role: row[6] || 'Dancer',
        paidStatus: row[7] || 'Unpaid',
        progressBySeamstress: row[8] || 'Not Started',
        lastNotifiedDate: row[9] || '',
        checkInStatus: row[10] || 'Not Ready',
        rowIndex: index + 2,
      };
    });
    console.log('Loaded dancers:', dancers.length);
    return dancers;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return [
      { id: 1, name: 'Dancer 1', girth: 80, chest: 85, waist: 70, hips: 90, role: 'Lead', paidStatus: 'Paid', progressBySeamstress: 'Completed', lastNotifiedDate: '2023-10-01', checkInStatus: 'Not Ready', rowIndex: 2 },
      { id: 2, name: 'Dancer 2', girth: 75, chest: 80, waist: 65, hips: 85, role: 'Ensemble', paidStatus: 'Unpaid', progressBySeamstress: 'In Progress', lastNotifiedDate: '2023-09-15', checkInStatus: 'Not Ready', rowIndex: 3 },
    ];
  }
};

export const updateDancerStatus = async (rowIndex, status) => {
  try {
    await init();
    const token = await authenticate();
    
    const range = `Sheet1!K${rowIndex}`;
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [[status]],
        }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Update failed:', errorData);
      throw new Error(errorData.error?.message || 'Failed to update status');
    }
    
    const result = await response.json();
    console.log(`Updated row ${rowIndex} status to ${status}`, result);
    return result;
  } catch (error) {
    console.error('Error updating status:', error);
    throw error;
  }
};

export const updateDancerMeasurements = async (rowIndex, measurements) => {
  try {
    await init();
    const token = await authenticate();
    
    // Update columns C through F (girth, chest, waist, hips)
    const range = `Sheet1!C${rowIndex}:F${rowIndex}`;
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [[measurements.girth, measurements.chest, measurements.waist, measurements.hips]],
        }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Update failed:', errorData);
      throw new Error(errorData.error?.message || 'Failed to update measurements');
    }
    
    const result = await response.json();
    console.log(`Updated row ${rowIndex} measurements`, result);
    return result;
  } catch (error) {
    console.error('Error updating measurements:', error);
    throw error;
  }
};

export const updateSheetData = async (sheetId, values) => {
  try {
    await init();
    const token = await authenticate();
    
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${RANGE}:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [values],
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to append data');
    }
    
    console.log('Data appended');
  } catch (error) {
    console.error('Error updating sheet:', error);
  }
};

export const saveSchedule = async (sheetId, schedule) => {
  const values = [schedule.id, schedule.title, schedule.date, schedule.time, schedule.assignedDancers.join(',')];
  await updateSheetData(sheetId, values);
};
