const express = require('express');
const app = express();
const path = require('path');

const phishedTargets = [];

// Route: When someone visits 'localhost:3000/phish'
app.get('/clicked', (req, res) => {

    //getting the username
    const targetName = req.query.user || "Unknown Target";

    const currentTime = new Date().toLocateTimeString();

    phishedTargets.push({ 
        name: targetName, 
        time: currentTime 
    });

    // Log it to the terminal link before
    console.log(`[ALERT] Target compromised: ${targetName} clicked the link at ${currentTime}!`);

    // Send the fake maintenance page to the target
    res.send("<h1>404 - Page Not Found</h1><p>The system is currently undergoing maintenance.</p>");
});

app.listen(3000, () => {
    console.log('Safety Net Server is running. Listening on port 3000...');
});