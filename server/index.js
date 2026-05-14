// src/server/index.js
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config({ path: "../../.env" }); 

const app = express();
const PORT = process.env.PORT || 3000;

// ALLOW CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://studyspot1.vercel.app",
    "https://studyspotph.vercel.app"
  ]
}));

app.use(express.json());

// DB Connection Pool
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
});

// GET /api/cafes
// This query joins Cafe, CafeAttributes, and StudyScore tables
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
        COALESCE(ss.aggregate_score, 0) AS aggregate_score
      FROM Cafe c
      LEFT JOIN CafeAttributes ca ON c.cafe_id = ca.cafe_id
      LEFT JOIN StudyScore ss     ON c.cafe_id = ss.cafe_id
      ORDER BY ss.aggregate_score DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});