import express from "express";
import cors from "cors";
import { spawn } from "child_process";
import pool from "./db.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

/* ===============================
   PATH FIX (ES MODULE SAFE)
   =============================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===============================
   HEALTH CHECK
   =============================== */
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "OK", db: "connected" });
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ status: "DB ERROR" });
  }
});

/* ===============================
   LOGIN (UNCHANGED)
   =============================== */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT username, section_code FROM users WHERE username=$1 AND password=$2",
      [username, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Database error" });
  }
});

/* ===============================
   AI CONFLICT RESOLUTION API
   =============================== */
app.post("/ai-suggest", (req, res) => {
  const payload = req.body;

  // 🔴 HARD VALIDATION (prevents silent failure)
  const required = [
    "priority_train",
    "affected_train",
    "passengers",
    "distance_km",
    "travel_time_hr",
    "train_capacity",
    "is_peak_hour",
    "delay"
  ];

  for (const key of required) {
    if (payload[key] === undefined) {
      return res.status(400).json({
        error: `Missing required field: ${key}`
      });
    }
  }

  try {
    const pythonScript = path.join(
      __dirname,
      "../ai_model/predict_train.py"
    );

    const python = spawn("python", [pythonScript]);

    let output = "";
    let error = "";

    python.stdin.write(JSON.stringify(payload));
    python.stdin.end();

    python.stdout.on("data", data => {
      output += data.toString();
    });

    python.stderr.on("data", data => {
      error += data.toString();
    });

    python.on("close", () => {
      if (error) {
        console.error("PYTHON STDERR:", error);
        return res.status(500).json({ error: "AI execution failed" });
      }

      try {
        res.json(JSON.parse(output));
      } catch (e) {
        console.error("INVALID AI OUTPUT:", output);
        res.status(500).json({ error: "Invalid AI response format" });
      }
    });

  } catch (err) {
    console.error("AI ROUTE ERROR:", err);
    res.status(500).json({ error: "AI server error" });
  }
});

/* ===============================
   START SERVER
   =============================== */
app.listen(5000, () => {
  console.log("🚀 Backend running at http://localhost:5000");
});
