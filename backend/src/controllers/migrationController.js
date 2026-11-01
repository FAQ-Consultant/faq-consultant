import { randomUUID } from "crypto";
import { getDb } from "../db/database.js";
import {
  checkConflict,
  getAppointmentById,
  validateFields,
} from "../db/appointmentRepository.js";

/**
 * POST /api/migrate/appointments
 *
 * Bulk-import appointment records.  Admin only (enforced in router via adminAuth).
 *
 * Body: { appointments: [{ name, phone, date, time, status?, id? }, ...] }
 * Response: { imported: N, skipped: N, errors: [...] }
 *
 * The entire batch runs inside a single SQLite transaction.  Any unhandled
 * critical error causes a full rollback.  Individual validation failures are
 * recorded in the errors array but do NOT abort the transaction.
 */
export async function migrateAppointments(req, res) {
  const { appointments } = req.body ?? {};

  if (!Array.isArray(appointments) || appointments.length === 0) {
    return res
      .status(400)
      .json({ error: "Trường 'appointments' phải là mảng không rỗng." });
  }

  const db = getDb();

  let imported = 0;
  let skipped = 0;
  const errors = [];

  const runMigration = db.transaction(() => {
    for (let i = 0; i < appointments.length; i++) {
      const item = appointments[i];
      const label = `Mục ${i + 1}`;

      // --- Check duplicate by provided id ---
      if (item.id) {
        const existing = getAppointmentById(item.id);
        if (existing) {
          skipped++;
          continue;
        }
      }

      // --- Check duplicate by name + date + time ---
      const byNameDateTimeStmt = db.prepare(
        `SELECT 1 FROM appointments WHERE name = ? AND date = ? AND time = ? LIMIT 1`
      );
      const nameDupRow = byNameDateTimeStmt.get(
        (item.name ?? "").trim(),
        item.date ?? "",
        item.time ?? ""
      );
      if (nameDupRow) {
        skipped++;
        continue;
      }

      // --- Validate ---
      const validationError = validateFields({
        name: item.name,
        phone: item.phone,
        date: item.date,
        time: item.time,
      });
      if (validationError) {
        errors.push({ index: i, label, error: validationError });
        continue;
      }

      // --- Conflict check (same date+time slot already taken) ---
      const id = item.id || randomUUID();
      if (checkConflict(item.date, item.time, id)) {
        errors.push({
          index: i,
          label,
          error: `Khung giờ ${item.date} ${item.time} đã bị trùng.`,
        });
        continue;
      }

      // --- Insert ---
      const VALID_STATUSES = ["pending", "confirmed", "cancelled", "done"];
      const status = VALID_STATUSES.includes(item.status)
        ? item.status
        : "pending";
      const now = new Date().toISOString();

      db.prepare(
        `INSERT INTO appointments (id, name, phone, date, time, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(
        id,
        item.name.trim(),
        item.phone.trim(),
        item.date,
        item.time,
        status,
        now
      );

      imported++;
    }
  });

  try {
    runMigration();
  } catch (err) {
    console.error("Migration transaction failed:", err.message);
    return res.status(500).json({
      error: "Lỗi trong quá trình nhập dữ liệu, đã rollback toàn bộ.",
    });
  }

  return res.status(200).json({ imported, skipped, errors });
}
