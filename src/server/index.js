// src/server/index.js
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config({ path: "../../.env" }); // points up to root .env

const app = express();
const PORT = process.env.PORT || 3000;

// ── CORS — allow your Vercel frontend to call this server ──────────────────
// Replace the URL below with your actual Vercel URL once deployed
app.use(cors({
  origin: [
    "http://localhost:5173",          // local dev (Vite default)
    "https://your-app.vercel.app",    // replace with your real Vercel URL
  ]
}));

app.use(express.json());

// ── DB Connection Pool ─────────────────────────────────────────────────────
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
});

// ── GET /api/cafes ─────────────────────────────────────────────────────────
// Returns all cafes with their coordinates + StudyScore for the map markers
app.get("/api/cafes", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.cafe_id,
        c.name,
        c.address,
        c.lat,
        c.lng,
        c.closing_time,
        ca.wifi_available,
        ca.outlet_available,
        ca.noise_level,
        ca.min_spend,
        COALESCE(ss.aggregate_score, 0) AS study_score
      FROM Cafe c
      LEFT JOIN CafeAttributes ca ON c.cafe_id = ca.cafe_id
      LEFT JOIN StudyScore ss     ON c.cafe_id = ss.cafe_id
      ORDER BY ss.aggregate_score DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Failed to fetch cafes" });
  }
});

// ── Health check — useful for Render to know the server is alive ───────────
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`StudySpot server running on port ${PORT}`);
});