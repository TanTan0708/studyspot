// src/server/index.js
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config({ path: "../../.env" }); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://studyspot1.vercel.app",
    "https://studyspotph.vercel.app"
  ]
}));

app.use(express.json());

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
app.get("/api/cafes", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.cafe_id,
        c.name,
        c.address,
        CAST(c.lat AS DOUBLE)  AS lat,
        CAST(c.lng AS DOUBLE)  AS lng,
        c.closing_time,
        -- BOOLEAN columns come back as 1/0 from MySQL — convert explicitly
        IF(ca.wifi_available   = 1, true, false) AS wifi_available,
        IF(ca.outlet_available = 1, true, false) AS outlet_available,
        ca.noise_level,
        CAST(ca.min_spend AS DOUBLE) AS min_spend,
        -- CAST so the frontend receives a real JS number, not a string "6.50"
        CAST(COALESCE(ss.aggregate_score, 0) AS DOUBLE) AS aggregate_score
      FROM Cafe c
      LEFT JOIN CafeAttributes ca ON c.cafe_id = ca.cafe_id
      LEFT JOIN StudyScore ss     ON c.cafe_id = ss.cafe_id
      ORDER BY ss.aggregate_score DESC, c.name ASC
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