# Phishing Detector Reporting Module

A focused telemetry and reporting engine designed to track analytics, calculate percentages, and generate compliance reports for internal training awareness assessments.

## Features

**Memory-Efficient Analytics Processing**
- Calculates real-time click-through rate percentages ($CTR$).
- Formats chronological timeline data hourly using Chart.js visualization.
- Tracks audit logs with persistent localized storage using SQLite.

 **Zero-Disk Streaming Exports**
- Generates and streams CSV reports dynamically from system memory down the network pipe.
- Compiles a complete metadata JSON package available for download with a single click.

**Educational Intervention**
- Intercepts clicks to immediately present users with a training landing page highlighting missed red flags.

## Installation

```bash
cd SafetyNet
npm install

## Running the Server

```bash
npm start
```

Server runs on `http://localhost:3000/targets`

## Analystical API Endpoints

### Dashboard
- `GET /targets` - Renders the central administrative statistics scoreboard view

### Analytics API
- `GET /api/analytics` - Get campaign statistics (clicks, rate, timeline)
- `GET /api/targets` - Pulls the complete arrays of recorded tracking logs
- `POST /api/set-total-targets` - Set total targets for click rate calculation

### Export
- `GET /export/csv` - Download report as CSV
- `GET /export/json` - Download report as JSON with metadata

## Usage Example

```bash
# Record a click
curl "http://localhost:3000/clicked?user=john.doe@example.com"

# Set total targets (for click rate calculation)
curl -X POST http://localhost:3000/api/set-total-targets \
  -H "Content-Type: application/json" \
  -d '{"total": 100}'

# Get analytics
curl "http://localhost:3000/api/analytics"

# Export as CSV
curl "http://localhost:3000/export/csv" > report.csv

# Export as JSON
curl "http://localhost:3000/export/json" > report.json
```

