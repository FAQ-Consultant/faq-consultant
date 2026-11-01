import { randomUUID } from "crypto";
import { getDb } from "./database.js";

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const PHONE_REGEX = /^0[0-9]{9,10}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
const VALID_STATUSES = ["pending", "confirmed", "cancelled", "done"];

/**
 * Validate appointment fields.
 * @returns {string|null} Error message or null if valid
 */
function validateFields({ name, phone, date, time }) {
  if (!name || typeof name !== "string" || !name.trim()) {
    return "Tên không được để trống.";
  }
  if (name.trim().length > 100) {
    return "Tên không được vượt quá 100 ký tự.";
  }
  if (!phone || !PHONE_REGEX.test(phone.trim())) {
    return "Số điện thoại không hợp lệ (10-11 chữ số, bắt đầu bằng 0).";
  }
  if (!date || !DATE_REGEX.test(date)) {
    return "Ngày không hợp lệ (định dạng YYYY-MM-DD).";
  }
  const appointmentDate = new Date(date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (isNaN(appointmentDate.getTime()) || appointmentDate < today) {
    return "Ngày hẹn phải là hôm nay hoặc trong tương lai.";
  }
  if (!time || !TIME_REGEX.test(time)) {
    return "Giờ không hợp lệ (định dạng HH:MM).";
  }
  const hour = parseInt(time.split(":")[0], 10);
  if (hour < 8 || hour >= 17) {
    return "Giờ hẹn phải trong giờ làm việc (08:00 - 17:00).";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Repository functions
// ---------------------------------------------------------------------------

/**
 * Check whether a time slot is already taken.
 * @param {string} date
 * @param {string} time
 * @param {string} [excludeId] Appointment id to ignore (for updates)
 * @returns {boolean}
 */
export function checkConflict(date, time, excludeId = null) {
  const db = getDb();
  let stmt;
  if (excludeId) {
    stmt = db.prepare(
      `SELECT 1 FROM appointments
       WHERE date = ? AND time = ? AND status != 'cancelled' AND id != ?
       LIMIT 1`
    );
    return !!stmt.get(date, time, excludeId);
  }
  stmt = db.prepare(
    `SELECT 1 FROM appointments
     WHERE date = ? AND time = ? AND status != 'cancelled'
     LIMIT 1`
  );
  return !!stmt.get(date, time);
}

/**
 * Create a new appointment.
 * @param {{ name: string, phone: string, date: string, time: string }} fields
 * @returns {{ record: object }|{ error: string }}
 */
export function createAppointment({ name, phone, date, time }) {
  const validationError = validateFields({ name, phone, date, time });
  if (validationError) return { error: validationError };

  if (checkConflict(date, time)) {
    return { error: "Khung giờ này đã được đặt. Vui lòng chọn giờ khác." };
  }

  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO appointments (id, name, phone, date, time, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?)`
  ).run(id, name.trim(), phone.trim(), date, time, now);

  return { record: getAppointmentById(id) };
}

/**
 * Get a single appointment by id.
 * @param {string} id
 * @returns {object|null}
 */
export function getAppointmentById(id) {
  const db = getDb();
  return (
    db
      .prepare(`SELECT * FROM appointments WHERE id = ?`)
      .get(id) ?? null
  );
}

/**
 * Paginated list of appointments (admin).
 * @param {{ status?: string, page?: number, limit?: number }} options
 * @returns {{ data: object[], total: number, page: number, limit: number }}
 */
export function getAllAppointments({ status, page = 1, limit = 20 } = {}) {
  const db = getDb();
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const offset = (safePage - 1) * safeLimit;

  let countQuery = `SELECT COUNT(*) as total FROM appointments`;
  let dataQuery = `SELECT * FROM appointments`;
  const params = [];

  if (status && VALID_STATUSES.includes(status)) {
    countQuery += ` WHERE status = ?`;
    dataQuery += ` WHERE status = ?`;
    params.push(status);
  }

  dataQuery += ` ORDER BY date ASC, time ASC LIMIT ? OFFSET ?`;

  const total = db.prepare(countQuery).get(...params)?.total ?? 0;
  const data = db
    .prepare(dataQuery)
    .all(...params, safeLimit, offset);

  return { data, total, page: safePage, limit: safeLimit };
}

/**
 * Update the status of an appointment.
 * @param {string} id
 * @param {string} status
 * @returns {{ record: object }|{ error: string }}
 */
export function updateAppointmentStatus(id, status) {
  if (!VALID_STATUSES.includes(status)) {
    return {
      error: `Trạng thái không hợp lệ. Chấp nhận: ${VALID_STATUSES.join(", ")}.`,
    };
  }
  const db = getDb();
  const now = new Date().toISOString();
  const result = db
    .prepare(
      `UPDATE appointments SET status = ?, updated_at = ? WHERE id = ?`
    )
    .run(status, now, id);

  if (result.changes === 0) return { error: "Không tìm thấy lịch hẹn." };
  return { record: getAppointmentById(id) };
}

/**
 * Cancel an appointment (set status to 'cancelled').
 * @param {string} id
 * @returns {{ record: object }|{ error: string }}
 */
export function cancelAppointment(id) {
  return updateAppointmentStatus(id, "cancelled");
}

export { validateFields, VALID_STATUSES };
