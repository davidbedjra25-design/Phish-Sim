const express = require('express');
const app = express();
const { dbOperations } = require('./db');

let currentCampaignId = null;

// Initialize campaign context safely on startup
(async () => {
  try {
    currentCampaignId = await dbOperations.getOrCreateCampaign();
    console.log(`[INIT] Reporting engine bound to campaign ID: ${currentCampaignId}`);
  } catch (err) {
    console.error("[CRITICAL] Failed to initialize database context:", err);
  }
})();

// Telemetry Link: Triggered when a tracking URL is hit
app.get('/clicked', async (req, res, next) => {
  try {
    const targetName = req.query.target || "Unknown Target";
    await dbOperations.addTarget(currentCampaignId, targetName);

    console.log(`[TELEMETRY] Compromise captured: ${targetName}`);

    // Educational training intervention response
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Phishing Simulation Alert</title>
        <style>
          body { font-family: 'Sagoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; color: #333; line-height: 1.6; padding: 40px 20px; }
          .container { max-width: 650px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; border-top: 6px solid #e74c3c; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
          h1 { color: #e74c3c; margin-top: 0; font-size: 28px; }
          .alert-box { background-color: #fdf0ed; border-left: 4px solid #e74c3c; padding: 15px; margin: 20px 0; border-radius: 4px; font-size: 16px;}
          .tips { background-color: #e8f4f8; padding: 25px; border-radius: 8px; margin-top: 30px; }
          .tips h3 { color: #2980b9; margin-top: 0; font-size: 20px;}
          ul { padding-left: 20px; }
          li {margin-bottom: 12px; }
          code { background: #eee; padding: 2px 6px; border-radius: 4px; color: #d35400; font-weight: bold;}
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Oops! You clicked a simulated phishing line.</h1>

          <div class="alert-box">
            <strong>Don't panic!</strong> This was an authorized security test conducted by your IT department. Your computer is safe and no data was compromised.
          </div>

          <p>You recently received an email claiming to be an <strong>"URGENT Mandatory Password Reset"</strong>. In the real world, clicking the link in that email could have allowed cybercriminals to steal your credentials and bypass our security.</p>

          <div class="tips">
              <h3>How to spot this next time:</h3>
              <ul>
                  <li><strong>Check the Sender:</strong> The email came from <code>it-support@company-portal.com</code>. Always verify that the domain perfectly matches our actual company domain. Cybercriminals often use domains that look "close enough".</li>
                  <li><strong>Beware of Urgency:</strong> Cybercriminals use words like "URGENT", "Mandatory", or "Action Required" to make you panic and click without thinking. Always slow down.</li>
                  <li><strong>Hover Before You Click:</strong> If you hovered your mouse over the link in the email, you would have seen it led to an unrecognized tracking server, not the real login page.</li>
              </ul>
          </div>

          <p style="text-align: center; margin-top: 30px; font-size: 14px; colorL #7f8c8d; font-weight: bold;">
            Security is everyone's responsibility. Stay vigilant!
          </p>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    next(err);
  }
});

// API: Core Statistical Calculations
app.get('/api/analytics', async (req, res, next) => {
  try {
    const analytics = await dbOperations.getAnalytics(currentCampaignId);
    const timeline = await dbOperations.getClickTimeline(currentCampaignId);
    
    const rawRate = analytics.total_targets > 0 ? ((analytics.total_clicked / analytics.total_targets) * 100) : 0;
    //Cap the percentage at a maximum of 100%
    const clickRate = Math.min(rawRate, 100).toFixed(2);

    res.json({
      total_clicked: analytics.total_clicked,
      total_targets: analytics.total_targets || 0,
      click_rate: parseFloat(clickRate),
      timeline: timeline
    });
  } catch (err) {
    next(err);
  }
});

// API: Fetch Complete Hit List
app.get('/api/targets', async (req, res, next) => {
  try {
    const targets = await dbOperations.getTargets(currentCampaignId);
    res.json(targets);
  } catch (err) {
    next(err);
  }
});

// API: Establish Target Base Size
app.post('/api/set-total-targets', express.json(), async (req, res, next) => {
  try {
    const { total } = req.body;
    if (typeof total !== 'number' || total < 0) {
      return res.status(400).json({ error: "Invalid total target limit variable" });
    }
    await dbOperations.setTotalTargets(currentCampaignId, total);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Stream Exporter: Generates runtime memory CSV data directly down pipe
app.get('/export/csv', async (req, res, next) => {
  try {
    const targets = await dbOperations.getTargets(currentCampaignId);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="phishing_simulation_report.csv"');

    // Build directly into server buffer string memory block
    let csvPayload = "Target Identifier,Timestamp Recorded\n";
    for (const target of targets) {
      csvPayload += `"${target.name}","${new Date(target.clicked_at).toISOString()}"\n`;
    }

    res.status(200).send(csvPayload);
  } catch (err) {
    next(err);
  }
});

// Stream Exporter: JSON Metadata package
app.get('/export/json', async (req, res, next) => {
  try {
    const targets = await dbOperations.getTargets(currentCampaignId);
    const analytics = await dbOperations.getAnalytics(currentCampaignId);
    
    const clickRate = analytics.total_targets > 0 
      ? ((analytics.total_clicked / analytics.total_targets) * 100).toFixed(2)
      : 0;

    const exportMetaPackage = {
      campaign_id: currentCampaignId,
      exported_at: new Date().toISOString(),
      summary_metrics: {
        captured_clicks: analytics.total_clicked,
        total_baseline_targets: analytics.total_targets || 0,
        click_through_rate: parseFloat(clickRate)
      },
      raw_logs: targets
    };

    res.setHeader('Content-Disposition', 'attachment; filename="phishing_report.json"');
    res.json(exportMetaPackage);
  } catch (err) {
    next(err);
  }
});

// Central Presentation Layer View Template Route
app.get('/targets', async (req, res, next) => {
  try {
    const targets = await dbOperations.getTargets(currentCampaignId);
    const analytics = await dbOperations.getAnalytics(currentCampaignId);
    
    const clickRate = analytics.total_targets > 0 
      ? ((analytics.total_clicked / analytics.total_targets) * 100).toFixed(2)
      : 0;

    let tableRows = '';
    if (targets.length === 0) {
      tableRows = '<tr><td colspan="2" style="padding: 15px; text-align: center; color: #666;">No clicks yet. The tracking loop is standing by.</td></tr>';
    } else {
      targets.forEach(target => {
        tableRows += `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>${target.name}</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; color: #d9534f;">${new Date(target.clicked_at).toLocaleString()}</td>
          </tr>`;
      });
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Phish-Sim | Telemetry Engine</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f4f6f9; color: #333; padding: 40px 20px; }
          .container { max-width: 1100px; margin: 0 auto; }
          .header { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 30px; }
          h1 { color: #2c3e50; font-size: 24px; margin-bottom: 20px; }
          .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
          .stat-card { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; border-radius: 4px; }
          .stat-value { font-size: 28px; font-weight: bold; color: #2c3e50; margin-top: 5px; }
          .stat-label { font-size: 12px; text-transform: uppercase; color: #7f8c8d; font-weight: 600; }
          .content { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 30px; }
          @media (max-width: 768px) { .content { grid-template-columns: 1fr; } }
          .card { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
          .card h2 { color: #2c3e50; margin-bottom: 20px; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
          table { width: 100%; border-collapse: collapse; }
          th { background-color: #f8f9fa; color: #7f8c8d; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #eee; }
          td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
          .buttons { display: flex; gap: 10px; }
          button { padding: 10px 18px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s; }
          button:hover { background: #5568d3; }
          .refresh-btn { background: #27ae60; }
          .refresh-btn:hover { background: #219653; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛡️ Phishing Audit Telemetry Control</h1>
            <div class="stats">
              <div class="stat-card">
                <div class="stat-label">Clicks Logged</div>
                <div class="stat-value">${analytics.total_clicked}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Total Campaign Targets</div>
                <div class="stat-value">${analytics.total_targets || 0}</div>
              </div>
              <div class="stat-card" style="border-left-color: #e74c3c;">
                <div class="stat-label">Calculated Click Rate</div>
                <div class="stat-value">${clickRate}%</div>
              </div>
            </div>
          </div>

          <div class="content">
            <div class="card">
              <h2>📈 Velocity Breakdown (Hourly)</h2>
              <canvas id="clickChart"></canvas>
            </div>
            <div class="card">
              <h2>📋 Audit Detection Logs</h2>
              <table>
                <thead>
                  <tr>
                    <th>Target Identifier</th>
                    <th>Intercept Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRows}
                </tbody>
              </table>
            </div>
          </div>

          <div class="card" style="margin-top: 30px;">
            <h2>📦 Structural Exporters</h2>
            <div class="buttons">
              <button onclick="window.location.href='/export/csv'">Export Metrics to CSV</button>
              <button onclick="window.location.href='/export/json'">Export Full JSON Dataset</button>
              <button class="refresh-btn" onclick="location.reload()">Refresh View</button>
            </div>
          </div>
        </div>

        <script>
          async function loadChart() {
            try {
              const res = await fetch('/api/analytics');
              const data = await res.json();
              
              const labels = data.timeline.map(d => d.hour.split(' ')[1].substring(0,5));
              const counts = data.timeline.map(d => d.count);
              
              const ctx = document.getElementById('clickChart').getContext('2d');
              if(window.myChartInstance) window.myChartInstance.destroy();
              
              window.myChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                  labels: labels,
                  datasets: [{
                    data: counts,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.05)',
                    tension: 0.2,
                    fill: true,
                    borderWidth: 2
                  }]
                },
                options: {
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                }
              });
            } catch (err) {
              console.error("Chart generation fault:", err);
            }
          }
          loadChart();
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    next(err);
  }
});

// Central Express Error Catch Handler Middleware
app.use((err, req, res, next) => {
  console.error("[SERVER FAULT]:", err.stack);
  res.status(500).json({ error: "Internal processing disruption inside tracking pipeline" });
});

app.get('/api/campaign-start', async (req, res) => {
  //Extracting the number of emails sent from the URL
  const totalSent = req.query.total;

  if(totalSent) {
    console.log(`[SYSTEM ALERT] Java Engine reported ${totalSent} emails dispatched!`);

    try {
      // fixes the percentage math on the dashboard
      await dbOperations.setTotalTargets(currentCampaignId, parseInt(totalSent, 10));
      // Sending a 200 OK success code back to Java so the email dispatcher knows Node.js successfully caught the number of emails
      res.status(200).send("Metrics received successfully.")
    }
    catch(err) {
      console.error("[ERROR] Could not save total targets to database:", err);
      res.status(500).send("Database error");
    }

  }

  else {
    res.status(400).send("Missing total parameter.");
  }
})

app.listen(3000, () => {
  console.log("[ONLINE] Report metrics branch running at http://localhost:3000/targets");
});