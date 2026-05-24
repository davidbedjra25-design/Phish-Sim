const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'phishing.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_targets INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS targets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS campaign_metadata (
      campaign_id INTEGER PRIMARY KEY,
      total_targets INTEGER DEFAULT 0,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
    )
  `);
});

const dbOperations = {
  getOrCreateCampaign: () => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT id FROM campaigns WHERE name = 'Default' LIMIT 1`,
        (err, row) => {
          if (err) return reject(err);
          if (row) {
            resolve(row.id);
          } else {
            db.run(
              `INSERT INTO campaigns (name) VALUES (?)`,
              ['Default'],
              function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
              }
            );
          }
        }
      );
    });
  },

  addTarget: (campaignId, name) => {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO targets (campaign_id, name) VALUES (?, ?)`,
        [campaignId, name],
        function (err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  },

  getTargets: (campaignId) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT name, clicked_at FROM targets WHERE campaign_id = ? ORDER BY clicked_at DESC`,
        [campaignId],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        }
      );
    });
  },

  getAnalytics: (campaignId) => {
    return new Promise((resolve, reject) => {
      db.all(
        `
        SELECT 
          COUNT(*) as total_clicked,
          (SELECT total_targets FROM campaign_metadata WHERE campaign_id = ?) as total_targets
        FROM targets WHERE campaign_id = ?
        `,
        [campaignId, campaignId],
        (err, rows) => {
          if (err) return reject(err);
          const data = rows[0] || { total_clicked: 0, total_targets: 0 };
          resolve(data);
        }
      );
    });
  },

  getClickTimeline: (campaignId) => {
    return new Promise((resolve, reject) => {
      db.all(
        `
        SELECT 
          strftime('%Y-%m-%d %H:00:00', clicked_at) as hour,
          COUNT(*) as count
        FROM targets 
        WHERE campaign_id = ?
        GROUP BY hour
        ORDER BY hour ASC
        `,
        [campaignId],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        }
      );
    });
  },

  setTotalTargets: (campaignId, total) => {
    return new Promise((resolve, reject) => {
      db.run(
        `
        INSERT OR REPLACE INTO campaign_metadata (campaign_id, total_targets)
        VALUES (?, ?)
        `,
        [campaignId, total],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }
};

module.exports = { db, dbOperations };