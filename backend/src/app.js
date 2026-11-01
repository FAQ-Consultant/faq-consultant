import express from "express";
import chatRoutes from "./routes/chatRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import migrationRoutes from "./routes/migrationRoutes.js";

const app = express();
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.get("origin");
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,X-Admin-Token");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", chatRoutes);
app.use("/api", appointmentRoutes);
app.use("/api", migrationRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Không tìm thấy endpoint." });
});

app.use((error, _req, res, _next) => {
  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON không hợp lệ." });
  }
  if (error?.type === "entity.too.large") {
    return res.status(413).json({ error: "Nội dung yêu cầu vượt quá giới hạn cho phép." });
  }
  // Do not expose stack traces or external API response bodies.
  return res.status(500).json({ error: "Máy chủ gặp lỗi. Vui lòng thử lại sau." });
});

export default app;

