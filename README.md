# D&D 5e Homebrew PDFer

A standalone desktop application to turn your homebrew content into official-looking D&D 5e PDFs.

## Features
- **Automatic Detection**: Upload a PDF and the app detects if it's a creature, item, race, class, or weapon.
- **Stat Extraction**: Automatically parses stats, traits, and actions.
- **Official Layout**: Generates high-resolution PDFs using templates that mimic the Player's Handbook and Monster Manual.
- **Library**: Stores your creations locally with thumbnails and easy access.

## Setup Instructions

### Prerequisites
- Node.js 26.1.0 or later (as requested)
- npm

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   cd client && npm install
   ```

2. **Build the frontend**:
   ```bash
   npm run build
   ```

3. **Run the application**:
   ```bash
   npm run electron
   ```

## Development
To run in development mode with hot-reloading:
1. Start the React app:
   ```bash
   cd client && npm start
   ```
2. Start Electron (in a separate terminal):
   ```bash
   npm run electron
   ```

## Tech Stack
- **Frontend**: React, Lucide-React
- **Backend (Main Process)**: Electron, better-sqlite3
- **PDF Processing**: pdf-parse, Puppeteer
