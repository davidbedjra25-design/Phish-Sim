const express = require('express');
const app = express();
const path = require('path');

// Route: When someone visits 'localhost:3000/phish'
app.get('/phish', (req, res) => {

    //getting the username
    const targetName = req.query.user;

    if(targetName) {
        console.log(`[ALERT] Target compromised: ${targetName} clicked the link!`);
    }
    else {
        console.log(`[ALERT] Someone clicked the link, but no user ID was found.`);
    }

    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => {
    console.log('Safety Net Server is running. Listening on port 3000...');
});