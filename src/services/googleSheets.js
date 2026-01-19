// Google Sheets integration using Google Sheets API v4
// For client-side, use fetch to API endpoint for read, gapi for write with OAuth

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'YOUR_API_KEY_HERE';
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || 'YOUR_SHEET_ID_HERE';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE';
const RANGE = 'Sheet1!A:F'; // For dancers
const SCHEDULE_RANGE = 'Sheet1!G:J'; // For schedules

// Initialize gapi
if (window.gapi) {
  window.gapi.load('client:auth2', () => {
    window.gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
      scope: 'https://www.googleapis.com/auth/spreadsheets'
    });
  });
}

export const authenticate = async () => {
  if (!window.gapi) return;
  const auth = window.gapi.auth2.getAuthInstance();
  if (!auth.isSignedIn.get()) {
    await auth.signIn();
  }
  return auth.currentUser.get().getAuthResponse().access_token;
};

export const fetchSheetData = async (sheetId = SHEET_ID) => {
  try {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${RANGE}?key=${API_KEY}`);
    if (!response.ok) {
      throw new Error('Failed to fetch data from Google Sheets');
    }
    const data = await response.json();
    const rows = data.values.slice(1);
    return rows.map(row => ({
      id: parseInt(row[0]) || Date.now(),
      name: row[1] || '',
      girth: parseFloat(row[2]) || 0,
      chest: parseFloat(row[3]) || 0,
      waist: parseFloat(row[4]) || 0,
      hips: parseFloat(row[5]) || 0,
      role: row[6] || 'Dancer'
    }));
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return [
      { id: 1, name: 'Dancer 1', girth: 80, chest: 85, waist: 70, hips: 90, role: 'Lead' },
      { id: 2, name: 'Dancer 2', girth: 75, chest: 80, waist: 65, hips: 85, role: 'Ensemble' },
    ];
  }
};

export const updateSheetData = async (sheetId, values) => {
  try {
    await authenticate();
    const response = await window.gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: RANGE,
      valueInputOption: 'RAW',
      resource: { values: [values] }
    });
    console.log('Data appended:', response);
  } catch (error) {
    console.error('Error updating sheet:', error);
  }
};

export const saveSchedule = async (sheetId, schedule) => {
  const values = [schedule.id, schedule.title, schedule.date, schedule.time, schedule.assignedDancers.join(',')];
  await updateSheetData(sheetId, values);
};