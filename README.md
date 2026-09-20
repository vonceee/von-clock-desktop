# VON.CLOCK (Desktop)

A standalone daily routine dashboard built with **Electron**, **React 19**, and **Tailwind CSS**.

## Features
- **Daily Execution Queue**: Real-time scheduled tasks mapped to current system time.
- **Routine Editor**: Configure schedules per day, duplicate across weekdays/weekends.
- **Self-Contained Storage**: Persists data locally in JSON files inside application data with zero external dependencies.

## Development
```bash
npm install
npm run dev           # Run web dev server at http://localhost:5173
npm run dev:electron  # Run desktop Electron app with live reload
npm run build         # Build production web bundle
npm run dist          # Package into Windows .exe installer and portable app
```
