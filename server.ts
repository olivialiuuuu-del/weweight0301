import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.VERCEL ? path.join("/tmp", "weweight.db") : "weweight.db";
const db = new Database(dbPath);

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    height REAL,
    target_weight REAL,
    avatar_url TEXT,
    partner_id TEXT,
    invite_code TEXT UNIQUE,
    privacy_show_weight INTEGER DEFAULT 1,
    privacy_show_progress INTEGER DEFAULT 1,
    privacy_show_chart INTEGER DEFAULT 1,
    points INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS weight_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    weight REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    title TEXT,
    target_value REAL,
    type TEXT, -- 'weight' or 'date'
    deadline DATETIME,
    completed INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    title TEXT,
    cost INTEGER,
    description TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

const app = express();

async function startServer() {
  app.use(express.json());
  const PORT = 3000;

  // Mock user for demo purposes (since we don't have real auth yet)
  const DEFAULT_USER_ID = "user_olivia_yang";
  
  // Ensure default user exists
  let user = db.prepare("SELECT * FROM users WHERE id = ?").get(DEFAULT_USER_ID);
  
  if (!user) {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    db.prepare("INSERT INTO users (id, name, height, target_weight, invite_code, points) VALUES (?, ?, ?, ?, ?, ?)").run(
      DEFAULT_USER_ID, "Olivia", 165, 52.0, inviteCode, 12
    );

    // Create a mock partner
    const partnerId = "partner_yang";
    db.prepare("INSERT INTO users (id, name, height, target_weight, invite_code, partner_id) VALUES (?, ?, ?, ?, ?, ?)").run(
      partnerId, "Yang", 180, 75.0, "YANG-XP", DEFAULT_USER_ID
    );
    
    // Link Olivia to Yang
    db.prepare("UPDATE users SET partner_id = ? WHERE id = ?").run(partnerId, DEFAULT_USER_ID);
    
    // Add some mock records for Yang (Partner)
    const partnerBaseWeight = 80.0;
    for (let i = 10; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const weight = partnerBaseWeight - (10 - i) * 0.2 + (Math.random() * 0.6 - 0.3);
      db.prepare("INSERT INTO weight_records (user_id, weight, timestamp) VALUES (?, ?, ?)").run(
        partnerId, weight.toFixed(1), date.toISOString()
      );
    }
    
    // Add some mock records for Olivia (Primary)
    const baseWeight = 55.5;
    for (let i = 10; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const weight = baseWeight - (10 - i) * 0.3 + (Math.random() * 0.4 - 0.2);
      db.prepare("INSERT INTO weight_records (user_id, weight, timestamp) VALUES (?, ?, ?)").run(
        DEFAULT_USER_ID, weight.toFixed(1), date.toISOString()
      );
    }

    // Add some mock goals
    db.prepare("INSERT INTO goals (user_id, title, target_value, type) VALUES (?, ?, ?, ?)").run(
      DEFAULT_USER_ID, "Reach 52kg", 52.0, "weight"
    );
    db.prepare("INSERT INTO goals (user_id, title, target_value, type) VALUES (?, ?, ?, ?)").run(
      DEFAULT_USER_ID, "Maintain for 7 days", 7, "date"
    );

    // Add some mock coupons
    db.prepare("INSERT INTO coupons (user_id, title, cost, description) VALUES (?, ?, ?, ?)").run(
      DEFAULT_USER_ID, "Fancy Dinner", 100, "A high-quality low-carb dinner prepared by your partner."
    );
    db.prepare("INSERT INTO coupons (user_id, title, cost, description) VALUES (?, ?, ?, ?)").run(
      DEFAULT_USER_ID, "Full Body Massage", 50, "30 minutes of relaxation after a long day."
    );
  }

  // API Routes
  app.get("/api/user", (req, res) => {
    const user = db.prepare(`
      SELECT u.*, p.name as partner_name, p.avatar_url as partner_avatar,
             p.privacy_show_weight as p_show_weight, 
             p.privacy_show_progress as p_show_progress,
             p.privacy_show_chart as p_show_chart
      FROM users u 
      LEFT JOIN users p ON u.partner_id = p.id 
      WHERE u.id = ?
    `).get(DEFAULT_USER_ID);
    res.json(user);
  });

  app.post("/api/user/update", (req, res) => {
    const { name, height, target_weight, privacy_show_weight, privacy_show_progress, privacy_show_chart } = req.body;
    db.prepare(`
      UPDATE users SET 
        name = ?, height = ?, target_weight = ?, 
        privacy_show_weight = ?, privacy_show_progress = ?, privacy_show_chart = ?
      WHERE id = ?
    `).run(name, height, target_weight, privacy_show_weight, privacy_show_progress, privacy_show_chart, DEFAULT_USER_ID);
    res.json({ success: true });
  });

  app.get("/api/records", (req, res) => {
    const records = db.prepare("SELECT * FROM weight_records WHERE user_id = ? ORDER BY timestamp DESC LIMIT 30").all(DEFAULT_USER_ID);
    res.json(records);
  });

  app.post("/api/records", (req, res) => {
    const { weight } = req.body;
    db.prepare("INSERT INTO weight_records (user_id, weight) VALUES (?, ?)").run(DEFAULT_USER_ID, weight);
    
    // Award 1 point for recording
    db.prepare("UPDATE users SET points = points + 1 WHERE id = ?").run(DEFAULT_USER_ID);
    
    res.json({ success: true });
  });

  app.get("/api/partner/records", (req, res) => {
    const user = db.prepare("SELECT partner_id FROM users WHERE id = ?").get(DEFAULT_USER_ID);
    if (!user?.partner_id) return res.json([]);
    
    const records = db.prepare("SELECT * FROM weight_records WHERE user_id = ? ORDER BY timestamp DESC LIMIT 30").all(user.partner_id);
    res.json(records);
  });

  app.get("/api/goals", (req, res) => {
    const goals = db.prepare("SELECT * FROM goals WHERE user_id = ?").all(DEFAULT_USER_ID);
    res.json(goals);
  });

  app.post("/api/goals", (req, res) => {
    const { title, target_value, type, deadline } = req.body;
    db.prepare("INSERT INTO goals (user_id, title, target_value, type, deadline) VALUES (?, ?, ?, ?, ?)").run(
      DEFAULT_USER_ID, title, target_value, type, deadline
    );
    res.json({ success: true });
  });

  app.get("/api/coupons", (req, res) => {
    const coupons = db.prepare("SELECT * FROM coupons WHERE user_id = ?").all(DEFAULT_USER_ID);
    res.json(coupons);
  });

  app.post("/api/partner/connect", (req, res) => {
    const { invite_code } = req.body;
    const partner = db.prepare("SELECT id FROM users WHERE invite_code = ?").get(invite_code);
    if (partner && partner.id !== DEFAULT_USER_ID) {
      db.prepare("UPDATE users SET partner_id = ? WHERE id = ?").run(partner.id, DEFAULT_USER_ID);
      db.prepare("UPDATE users SET partner_id = ? WHERE id = ?").run(DEFAULT_USER_ID, partner.id);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Invalid invite code" });
    }
  });

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

export default app;

startServer();
