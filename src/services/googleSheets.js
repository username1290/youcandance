// Google Sheets integration using Google Sheets API v4
// Using Google Identity Services (GIS) for authentication

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || ''
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || ''
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const RANGE = 'Sheet1!A:M' // Added recitalId column (L) and recitalSpecificRole (M)
const RECITAL_METADATA_RANGE = 'Sheet4!A:G'

let tokenClient = null
let accessToken = null

// --- Persistence Helpers ---
const STORAGE_KEY_TOKEN = 'google_access_token';
const STORAGE_KEY_EXPIRY = 'google_token_expiry';

const saveToken = (token, expiresInSeconds) => {
  const expiryTime = Date.now() + (expiresInSeconds * 1000);
  sessionStorage.setItem(STORAGE_KEY_TOKEN, token);
  sessionStorage.setItem(STORAGE_KEY_EXPIRY, expiryTime.toString());
  accessToken = token;
};

const getStoredToken = () => {
  const token = sessionStorage.getItem(STORAGE_KEY_TOKEN);
  const expiry = sessionStorage.getItem(STORAGE_KEY_EXPIRY);
  
  if (token && expiry && Date.now() < parseInt(expiry)) {
    console.log('Using valid stored access token');
    return token;
  }
  return null;
};
// ---------------------------

// Load the Google API client library
const loadGapiClient = () => {
  return new Promise((resolve, reject) => {
    if (window.gapi && window.gapi.client) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.onload = () => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
          })
          console.log('GAPI client initialized')
          resolve()
        } catch (error) {
          console.error('Error initializing GAPI client:', error)
          reject(error)
        }
      })
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// Load Google Identity Services
const loadGis = () => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts) {
      initTokenClient()
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = () => {
      initTokenClient()
      resolve()
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

const initTokenClient = () => {
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    callback: (response) => {
      if (response.error) {
        console.error('Token error:', response)
        return
      }
      // Save token with expiry (using default 3599s if not provided, though it usually is)
      const expiresIn = response.expires_in || 3599; 
      saveToken(response.access_token, expiresIn);
      console.log('Access token obtained and stored')
    },
  })
  
  // Attempt to restore token on init
  const stored = getStoredToken();
  if (stored) {
    accessToken = stored;
  }
  
  console.log('GIS initialized')
}

// Initialize both libraries
let initPromise = null
const init = () => {
  if (!initPromise) {
    initPromise = Promise.all([loadGapiClient(), loadGis()])
  }
  return initPromise
}

// Start initialization immediately
init().catch(console.error)

export const authenticate = () => {
  return new Promise((resolve, reject) => {
    // 1. Check in-memory variable
    if (accessToken) {
      resolve(accessToken)
      return
    }
    
    // 2. Check storage
    const stored = getStoredToken();
    if (stored) {
      accessToken = stored;
      resolve(stored);
      return;
    }

    // 3. Request new token
    if (!tokenClient) {
      reject(new Error('Token client not initialized'))
      return
    }
    // Override callback for this specific request
    tokenClient.callback = (response) => {
      if (response.error) {
        reject(response)
        return
      }
      const expiresIn = response.expires_in || 3599;
      saveToken(response.access_token, expiresIn);
      resolve(response.access_token)
    }
    tokenClient.requestAccessToken({ prompt: '' })
  })
}

export const signOut = () => {
  if (accessToken && window.google) {
    window.google.accounts.oauth2.revoke(accessToken, () => {
      console.log('Access token revoked')
      accessToken = null
      sessionStorage.removeItem(STORAGE_KEY_TOKEN);
      sessionStorage.removeItem(STORAGE_KEY_EXPIRY);
      window.location.reload()
    })
  } else {
    accessToken = null
    sessionStorage.removeItem(STORAGE_KEY_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_EXPIRY);
    window.location.reload()
  }
}

export const fetchSheetData = async (sheetId = SHEET_ID) => {
  try {
    await init()
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${RANGE}?key=${API_KEY}`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch data from Google Sheets')
    }
    const data = await response.json()
    if (!data.values || data.values.length === 0) {
      return []
    }
    const rows = data.values.slice(1)
    const dancers = rows.map((row, index) => {
      // Step 1: Support robust UUIDs (Strings) instead of fragile Integers
      const rawId = row[0]
      const id = (rawId && rawId.length > 0) ? rawId : `dancer-${index}-${Date.now()}`
      
      return {
        id,
        name: row[1] || '',
        class: row[2] || '',
        girth: parseFloat(row[3]) || 0,
        chest: parseFloat(row[4]) || 0,
        waist: parseFloat(row[5]) || 0,
        hips: parseFloat(row[6]) || 0,
        role: row[7] || 'Dancer',
        paidStatus: row[8] || 'Unpaid',
        progressBySeamstress: row[9] || 'Not Started',
        lastNotifiedDate: row[10] || '',
        checkInStatus: row[11] || 'Not Ready',
        recitalId: row[12] || 'recital-1', // Default to first recital
        recitalSpecificRole: row[13] || '',
        rowIndex: index + 2,
      }
    })
    console.log('Loaded dancers:', dancers.length)
    return dancers
  } catch (error) {
    console.error('Error fetching sheet data:', error)
    return [
      {
        id: 1,
        name: 'Dancer 1',
        girth: 80,
        chest: 85,
        waist: 70,
        hips: 90,
        role: 'Lead',
        paidStatus: 'Paid',
        progressBySeamstress: 'Completed',
        lastNotifiedDate: '2023-10-01',
        checkInStatus: 'Not Ready',
        rowIndex: 2,
      },
      {
        id: 2,
        name: 'Dancer 2',
        girth: 75,
        chest: 80,
        waist: 65,
        hips: 85,
        role: 'Ensemble',
        paidStatus: 'Unpaid',
        progressBySeamstress: 'In Progress',
        lastNotifiedDate: '2023-09-15',
        checkInStatus: 'Not Ready',
        rowIndex: 3,
      },
    ]
  }
}

export const updateDancerStatus = async (rowIndex, status) => {
  try {
    await init()
    const token = await authenticate()

    // First, get the headers to find the correct column
    const headersResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1!1:1?key=${API_KEY}`
    )

    if (!headersResponse.ok) {
      throw new Error('Failed to get column headers')
    }

    const headersData = await headersResponse.json()
    const headers = headersData.values[0] || []
    const checkInStatusIndex = headers.findIndex(
      (h) => h && h.toLowerCase().includes('check-in status')
    )

    if (checkInStatusIndex === -1) {
      throw new Error('Check-in Status column not found. Please check your Google Sheet headers.')
    }

    // Convert to A1 notation (1-based)
    const columnLetter = String.fromCharCode(65 + checkInStatusIndex)
    const range = `Sheet1!${columnLetter}${rowIndex}`

    console.log(
      `Updating Check-in Status (column ${columnLetter}) for row ${rowIndex} to "${status}"`
    )

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [[status]],
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Update failed:', errorData)
      throw new Error(errorData.error?.message || 'Failed to update status')
    }

    const result = await response.json()
    console.log(`Successfully updated Check-in Status to ${status}`, result)
    return result
  } catch (error) {
    console.error('Error updating status:', error)
    throw error
  }
}

export const updateDancerMeasurements = async (rowIndex, measurements) => {
  try {
    await init()
    const token = await authenticate()

    // Update columns C through F (girth, chest, waist, hips)
    const range = `Sheet1!C${rowIndex}:F${rowIndex}`
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [[measurements.girth, measurements.chest, measurements.waist, measurements.hips]],
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Update failed:', errorData)
      throw new Error(errorData.error?.message || 'Failed to update measurements')
    }

    const result = await response.json()
    console.log(`Updated row ${rowIndex} measurements`, result)
    return result
  } catch (error) {
    console.error('Error updating measurements:', error)
    throw error
  }
}

export const updateSheetData = async (sheetId, values) => {
  try {
    await init()
    const token = await authenticate()

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${RANGE}:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [values],
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to append data')
    }

    console.log('Data appended')
  } catch (error) {
    console.error('Error updating sheet:', error)
  }
}

export const saveSchedule = async (sheetId, schedule) => {
  // Ensure assignedDancers is an array before joining
  const dancersArray = Array.isArray(schedule.assignedDancers)
    ? schedule.assignedDancers
    : schedule.assignedDancers
      ? [schedule.assignedDancers]
      : []

  const values = [schedule.id, schedule.title, schedule.date, schedule.time, dancersArray.join(',')]
  await updateSheetData(sheetId, values)
}

// Sheet2 - Recital Events functions
const RECITAL_RANGE = 'Sheet2!A:E'

export const saveRecitalEvent = async (sheetId, recitalEvent, recitalId = 'recital-1') => {
  try {
    await init()
    const token = await authenticate()

    // Map recitalId to sheet number
    const recitalNumber = recitalId.replace('recital-', '')
    let sheetNumber = parseInt(recitalNumber) + 1
    if (sheetNumber === 4) sheetNumber = 5
    const range = `Sheet${sheetNumber}!A:E`

    // Ensure assignedDancers is an array before joining
    const dancersArray = Array.isArray(recitalEvent.assignedDancers)
      ? recitalEvent.assignedDancers
      : recitalEvent.assignedDancers
        ? [recitalEvent.assignedDancers]
        : []

    const values = [
      recitalEvent.id,
      recitalEvent.title,
      recitalEvent.date,
      recitalEvent.time,
      dancersArray.join(','),
    ]

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [values],
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to append recital event')
    }

    const result = await response.json()
    console.log('Recital event appended:', result)

    // Return the rowIndex for the newly created event
    // The Google Sheets API doesn't directly return the row number for append operations,
    // so we need to fetch the data again to get the correct rowIndex
    const eventsData = await fetchRecitalEvents(sheetId, recitalId)
    const newEvent = eventsData.find((e) => e.id === recitalEvent.id)
    return newEvent ? newEvent.rowIndex : null
  } catch (error) {
    console.error('Error saving recital event:', error)
    throw error
  }
}

export const updateRecitalEvent = async (
  sheetId,
  rowIndex,
  updatedEvent,
  recitalId = 'recital-1'
) => {
  try {
    await init()
    const token = await authenticate()

    // Map recitalId to sheet number
    const recitalNumber = recitalId.replace('recital-', '')
    let sheetNumber = parseInt(recitalNumber) + 1
    if (sheetNumber === 4) sheetNumber = 5
    const range = `Sheet${sheetNumber}!A${rowIndex}:E${rowIndex}`

    // Ensure assignedDancers is an array before joining
    const dancersArray = Array.isArray(updatedEvent.assignedDancers)
      ? updatedEvent.assignedDancers
      : updatedEvent.assignedDancers
        ? [updatedEvent.assignedDancers]
        : []

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [
            [
              updatedEvent.id,
              updatedEvent.title,
              updatedEvent.date,
              updatedEvent.time,
              dancersArray.join(','),
            ],
          ],
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Update failed:', errorData)
      throw new Error(errorData.error?.message || 'Failed to update recital event')
    }

    const result = await response.json()
    console.log(`Updated row ${rowIndex} recital event`, result)
    return result
  } catch (error) {
    console.error('Error updating recital event:', error)
    throw error
  }
}

export const deleteRecitalEvent = async (sheetId, rowIndex, recitalId = 'recital-1') => {
  try {
    await init()
    const token = await authenticate()

    // Map recitalId to sheet number
    const recitalNumber = recitalId.replace('recital-', '')
    let sheetNumber = parseInt(recitalNumber) + 1
    if (sheetNumber === 4) sheetNumber = 5
    const deleteRange = `Sheet${sheetNumber}!A${rowIndex}:E${rowIndex}`
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${deleteRange}:clear`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to delete recital event')
    }

    console.log('Recital event deleted successfully')
  } catch (error) {
    console.error('Error deleting recital event:', error)
    throw error
  }
}

// Multi-Recital Management Functions
export const fetchAllRecitals = async (sheetId = SHEET_ID) => {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${RECITAL_METADATA_RANGE}?key=${API_KEY}`
    )
    if (!response.ok) {
      throw new Error(`Failed to fetch recitals: ${response.status} ${response.statusText}`)
    }
    const data = await response.json()
    if (!data.values || data.values.length === 0) {
      return []
    }
    const rows = data.values.slice(1) // Skip header row
    const recitals = rows.map((row, index) => ({
      id: row[0] || `recital-${index + 1}`,
      name: row[1] || 'Untitled Recital',
      date: row[2] || '',
      location: row[3] || '',
      school: row[4] || '',
      theme: row[5] || '',
      active: row[6] === 'TRUE' || row[6] === 'true' || false,
      rowIndex: index + 2,
    }))
    console.log('Loaded recitals:', recitals)
    return recitals
  } catch (error) {
    console.error('Error fetching recitals:', error)
    return [
      {
        id: 'recital-1',
        name: 'Spring Showcase 2024',
        date: '2024-06-15',
        location: 'Lincoln High School',
        school: 'Main Studio',
        theme: 'Under the Sea',
        active: true,
        rowIndex: 2,
      },
    ]
  }
}


export const fetchRecitalEvents = async (sheetId = SHEET_ID, recitalId = 'recital-1') => {
  // Map recitalId to sheet number (Sheet2 = recital-1, Sheet3 = recital-2, etc.)
  const recitalNumber = recitalId.replace('recital-', '')
  let sheetNumber = parseInt(recitalNumber) + 1 // Sheet2 for recital-1, Sheet3 for recital-2
  
  // Skip Sheet4 (Metadata) if calculated
  if (sheetNumber === 4) sheetNumber = 5

  let range = `Sheet${sheetNumber}!A:E`

  try {

    let response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${API_KEY}`
    )

    // Retry logic: If default sheet name fails, try to resolve via metadata
    if (response.status === 400) {
      console.warn(`Default sheet name Sheet${sheetNumber} failed. Trying to resolve via metadata...`)
      try {
        const metaResponse = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${API_KEY}`
        )
        const metaData = await metaResponse.json()
        
        // Try to find sheet by index
        // Default assumption:
        // Index 0: Dancers (Sheet1)
        // Index 1: Recital 1 (Sheet2)
        // Index 2: Recital 2 (Sheet3)
        // Index 3: Metadata (Sheet4)
        // ...
        
        const targetRecitalIndex = parseInt(recitalNumber) // 1 for recital-1, 2 for recital-2
        
        // Adjust for Metadata sheet being at index 3 (Sheet4)
        // If we are looking for recital-3 (index 3 logically), it might be pushed to index 4 physically?
        // This is fragile. Better to look for "SheetN" unless renamed.
        
        // Search by title match primarily
        const targetTitle = `Sheet${sheetNumber}`
        const sheetByName = metaData.sheets.find(s => s.properties.title === targetTitle)
        
        let resolvedTitle = null
        if (sheetByName) {
           resolvedTitle = sheetByName.properties.title
        } else {
           // Fallback to index based on recital number
           // +1 offset because Sheet1 is index 0
           // recital-1 -> index 1
           // recital-2 -> index 2
           // recital-3 -> index 4 (skip index 3/Sheet4) ??? 
           
           let targetIndex = parseInt(recitalNumber)
           // If we are past the metadata sheet (Sheet4 / index 3), shift +1?
           if (targetIndex >= 3) targetIndex += 1
           
           if (metaData.sheets && metaData.sheets[targetIndex]) {
              resolvedTitle = metaData.sheets[targetIndex].properties.title
           }
        }

        if (resolvedTitle) {
          console.log(`Resolved ${recitalId} to sheet "${resolvedTitle}"`)
          range = `'${resolvedTitle}'!A:E`
          
          response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${API_KEY}`
          )
        }
      } catch (metaError) {
        console.error('Failed to resolve sheet name via metadata:', metaError)
      }
    }

    // If sheet still doesn't exist (400 error), return empty array
    if (response.status === 400) {
      console.warn(
        `Sheet for ${recitalId} doesn't exist yet. Returning empty events.`
      )
      return []
    }

    if (!response.ok) {
      throw new Error(
        `Failed to fetch events for ${recitalId}: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    if (!data.values || data.values.length === 0) {
      console.warn(`No event data found for ${recitalId} (Sheet${sheetNumber})`)
      return []
    }

    const rows = data.values.slice(1) // Skip header row
    const events = rows.map((row, index) => ({
      id: row[0] || `event-${index}-${Date.now()}`,
      title: row[1] || 'Untitled Event',
      date: row[2] || '',
      time: row[3] || '',
      assignedDancers: row[4] ? row[4].split(',').map((id) => id.trim()) : [],
      recitalId: recitalId,
      rowIndex: index + 2,
      _raw: row,
    }))
    console.log(`[DEBUG] fetchRecitalEvents: Recital ${recitalId} (Sheet${sheetNumber}) raw rows:`, data.values)
    console.log(`[DEBUG] fetchRecitalEvents: Recital ${recitalId} (Sheet${sheetNumber}) parsed events:`, events)
    return events
  } catch (error) {
    console.error(`[DEBUG] Error fetching events for ${recitalId}:`, error)
    return []
  }
}

export const createRecital = async (sheetId, recitalData) => {
  try {
    await init()
    const token = await authenticate()

    const values = [
      recitalData.id,
      recitalData.name,
      recitalData.date,
      recitalData.location,
      recitalData.school,
      recitalData.theme,
      recitalData.active ? 'TRUE' : 'FALSE',
    ]

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${RECITAL_METADATA_RANGE}:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [values],
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to create recital')
    }

    console.log('Recital created successfully')
    return recitalData
  } catch (error) {
    console.error('Error creating recital:', error)
    throw error
  }
}

// Helper function to create a new sheet for recital events
export const createRecitalEventsSheet = async (sheetId, recitalId) => {
  try {
    await init()
    const token = await authenticate()

    const recitalNumber = recitalId.replace('recital-', '')
    let sheetNumber = parseInt(recitalNumber) + 1
    
    // Skip Sheet4 (Metadata)
    if (sheetNumber === 4) sheetNumber = 5

    const sheetTitle = `Sheet${sheetNumber}`

    // Create the sheet with headers
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetTitle}!A1:E1?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [['EventID', 'Title', 'Date', 'Time', 'AssignedDancers']],
        }),
      }
    )

    if (!response.ok) {
      console.warn(
        'Could not create recital events sheet automatically. It will be created when first event is added.'
      )
      return false
    }

    console.log(`Created ${sheetTitle} for recital ${recitalId}`)
    return true
  } catch (error) {
    console.error('Error creating recital events sheet:', error)
    return false
  }
}

export const updateRecital = async (sheetId, recitalId, updates) => {
  try {
    await init()
    const token = await authenticate()

    // First, find the recital's row
    const recitals = await fetchAllRecitals(sheetId)
    const recital = recitals.find((r) => r.id === recitalId)
    if (!recital || !recital.rowIndex) {
      throw new Error('Recital not found')
    }

    const range = `Sheet4!A${recital.rowIndex}:G${recital.rowIndex}`
    const updatedRecital = { ...recital, ...updates }

    const values = [
      updatedRecital.id,
      updatedRecital.name,
      updatedRecital.date,
      updatedRecital.location,
      updatedRecital.school,
      updatedRecital.theme,
      updatedRecital.active ? 'TRUE' : 'FALSE',
    ]

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [values],
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to update recital')
    }

    console.log('Recital updated successfully')
    return updatedRecital
  } catch (error) {
    console.error('Error updating recital:', error)
    throw error
  }
}

export const duplicateRecital = async (sheetId, sourceRecitalId, newRecitalData) => {
  try {
    await init()
    const token = await authenticate()

    // 1. Create the new recital metadata
    const createdRecital = await createRecital(sheetId, newRecitalData)

    // 2. Copy events from source recital
    const sourceEvents = await fetchRecitalEvents(sheetId, sourceRecitalId)
    const recitalNumber = createdRecital.id.replace('recital-', '')
    let targetSheetNumber = parseInt(recitalNumber) + 1
    if (targetSheetNumber === 4) targetSheetNumber = 5
    const targetRange = `Sheet${targetSheetNumber}!A:E`

    // Prepare events with new recitalId
    const eventsToCopy = sourceEvents.map((event) => {
      // Ensure assignedDancers is an array before joining
      const dancersArray = Array.isArray(event.assignedDancers)
        ? event.assignedDancers
        : event.assignedDancers
          ? [event.assignedDancers]
          : []

      return [
        event.id.replace(sourceRecitalId, createdRecital.id),
        event.title,
        event.date,
        event.time,
        dancersArray.join(','),
      ]
    })

    // Clear target sheet first (if it exists)
    try {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${targetRange}:clear`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
    } catch (clearError) {
      console.warn('Could not clear target sheet, it may not exist yet:', clearError)
    }

    // Append copied events
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${targetRange}:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: eventsToCopy,
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to copy recital events')
    }

    console.log('Recital duplicated successfully')
    return createdRecital
  } catch (error) {
    console.error('Error duplicating recital:', error)
    throw error
  }
}
