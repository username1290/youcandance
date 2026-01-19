# Recital Planner Coordination Platform

A Vite React PWA for coordinating recital dancers, including measurement tracking and conflict resolution.

## Features

- Dancer management with measurements
- Conflict detection engine
- Google Sheets integration for data storage
- PWA support for offline use
- Theater mode styling

## Setup

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set up Google Sheets API:
   - Create a Google Cloud Project at [Google Cloud Console](https://console.cloud.google.com/).
   - Enable the Google Sheets API.
   - Create an API key (for read operations on public sheets).
   - Create OAuth 2.0 credentials (Client ID) for write operations.
   - Create a Google Sheet and share it with edit permissions for the service account or configure OAuth consent screen.
   - Format the sheet with columns: id, name, girth, chest, waist, hips, role, paidStatus, progressBySeamstress, lastNotifiedDate.

3. Create a `.env` file in the root directory:
   ```
   VITE_GOOGLE_API_KEY=your_api_key_here
   VITE_GOOGLE_SHEET_ID=your_sheet_id_here
   VITE_GOOGLE_CLIENT_ID=your_client_id_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

- `src/components/` - React components
- `src/services/` - External service integrations (Google Sheets)
- `src/core/` - Business logic (conflict engine)
