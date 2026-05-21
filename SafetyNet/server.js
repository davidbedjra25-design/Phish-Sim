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

app.get('/targets', (req, res) => {
    let tableRows = '';

    if(phishedTargets.length == 0) {
        tableRows = '<tr><td colspan="2" style="padding: 15px; text-align: center; color: #666; ">No clicks yet. The trap is waiting. </td></tr>';
    }
    else {
        phishedTargets.forEach(target => {
            tableRows += `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>${target.name}</strong></td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; color: #d9534f;">${target.time}</td>
                </tr>`;
                
        });
    }

    const dashboardHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Phish-Sim | Live Dashboard</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; padding: 40px; margin: 0;}
                .container {max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                h1 { color: #2c3e50; margin-bottom: 20px; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background-color: #3498db; color: white; padding: 12px; text-align: left; }
                tr:hover { background-color: #f9f9f9; }
            </style>
        </head>
        <body>
            <div class = "container">
                <h1> Live Campaign Dashboard</h1>
                <p>Monitoring incoming traffic from dispatched payloads...</p>
                <table>
                    <thead>
                        <tr>
                            <th>Target Name</th>
                            <th>Time Compromised</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
    `;

    res.send(dashboardHTML);
});

app.listen(3000, () => {
    console.log("Safety Net Server is running. Listening on port 3000...");
    console.log("View live dashboard at: http://localhost:3000/dashboard");
});