// Google Sheets integration using Google Sheets API v4
// For client-side, use fetch to API endpoint
// Assumes the sheet is public or has API key

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'YOUR_API_KEY_HERE'; // Set in .env
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || 'YOUR_SHEET_ID_HERE'; // Replace with actual sheet ID
const RANGE = 'Sheet1!A1:F'; // Adjust range as needed

export const authenticate = async () => {
  // For client-side, OAuth is needed for write operations
  // Placeholder for now
  console.log('Authentication setup...');
};

export const fetchSheetData = async (sheetId = SHEET_ID) => {
  try {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${RANGE}?key=${API_KEY}`);
    if (!response.ok) {
      throw new Error('Failed to fetch data from Google Sheets');
    }
    const data = await response.json();
    // Assume first row is headers: id, name, girth, chest, waist, hips
    const rows = data.values.slice(1); // Skip header
    return rows.map(row => ({
      id: parseInt(row[0]),
      name: row[1],
      girth: parseFloat(row[2]),
      chest: parseFloat(row[3]),
      waist: parseFloat(row[4]),
      hips: parseFloat(row[5]),
      role: row[6] || 'Dancer' // Add role if present
    }));
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    // Fallback to mock data
    return [
      { id: 1, name: 'Dancer 1', girth: 80, chest: 85, waist: 70, hips: 90, role: 'Lead' },
      { id: 2, name: 'Dancer 2', girth: 75, chest: 80, waist: 65, hips: 85, role: 'Ensemble' },
    ];
  }
};

export const updateSheetData = async (sheetId, range, values) => {
  // For writing, need OAuth token
  // Placeholder
  console.log('Updating sheet data...');
  // In real implementation, use gapi or fetch with auth
};