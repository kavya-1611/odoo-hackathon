require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const leaveRoutes = require("./routes/leave.routes");
const payrollRoutes = require("./routes/payroll.routes");
const aiRoutes = require("./routes/ai.routes");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Health check — verify the server (and DB, once wired) is actually up.
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/ai", aiRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// Centralized error handler (catches anything thrown in async routes if
// you wrap them, and any synchronous errors in middleware/routes above).
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`PulseHR backend listening on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
