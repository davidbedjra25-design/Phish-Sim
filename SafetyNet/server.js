const { log } = require('console');
const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

// Helper function to read logs safely from the JSON File
function readLogs() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading log file: ", error);
        return [];
    }
}

// Helper function to write logs to the JSON file
function writeLogs(logs) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(logs, null, 2), 'utf8');
    } catch (error) {
        console.error("Error writing to log file: ", error);
    }
}

// Tracking Link Clicks

// Route: When someone visits 'localhost:3000/phish'
app.get('/clicked', (req, res) => {

    //getting the username
    const targetName = req.query.user || "Unknown Target";

    const currentTime = new Date().toLocateTimeString(); // Fixed date/ time typos

    const logs = readLogs();
    
    logs.push({ 
        name: targetName, 
        time: currentTime,
        action: 'clicked_link', // Action type 1
        riskLevel: 'Medium'
    });
    writeLogs(logs);

    // Log it to the terminal link before
    console.log(`[ALERT] Target compromised: ${targetName} clicked the link at ${currentTime}!`);

    // Send the fake maintenance page to the target
    res.send("<h1>404 - Page Not Found</h1><p>The system is currently undergoing maintenance.</p>");
});

// Tracking credential submissions
app.get('/submitted', (req, res) => {
    const targetName = req.query.user || "Unknown Target";
    const currentTime = new Date().toLocaleString();

    const logs = readLogs()
    logs.push({
        name: targetName,
        time: currentTime,
        action: 'submitted_credentials', // Action type 2
        riskLevel: 'High'
    });
    writeLogs(logs);

    console.log(`[CRITICAL] Target compromised: ${targetName} submitted data at ${currentTime}!`);
    
    // Send the fake maintenance page to the target
    res.send("<h1>404 - Page Not Found</h1><p>Please contact your IT administrator.</p>")

});

// Scoreboard API Endpoint
// Frontend scoreboard will fetch data from this route
app.get('/api/scoreboard', (req, res) => {
    const logs = readLogs();

    // Calculate quick stats on the fly for your scoreboard cards
    const totalClicks = logs.filter(log => log.action === 'clicked_link').length;
    const totalSubmissions = logs.filter(log => log.action === 'submitted_credentials').length;

    res.json({
        summary: {
            totalClicks,
            totalSubmissions,
            totalFailures: logs.length
        },
        detailedLogs: logs
    });
});

app.listen(3000, () => {
    console.log("Safety Net Server is running. Listening on port 3000...");
    console.log("View live dashboard at: http://localhost:3000/dashboard");
});