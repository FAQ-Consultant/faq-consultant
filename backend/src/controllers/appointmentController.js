import {
  cancelAppointment,
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
} from "../db/appointmentRepository.js";

// ---------------------------------------------------------------------------
// Public fields returned to non-admin callers for a single appointment
// ---------------------------------------------------------------------------
const PUBLIC_FIELDS = ["id", "date", "time", "status"];

function toPublicRecord(record) {
  if (!record) return null;
  return Object.fromEntries(
    PUBLIC_FIELDS.map((key) => [key, record[key]])
  );
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/** POST /api/appointments */
export async function createAppointmentHandler(req, res) {
  const { name, phone, date, time } = req.body ?? {};
  const result = createAppointment({ name, phone, date, time });

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  return res.status(201).json({ data: result.record });
}

/** GET /api/appointments/:id */
export async function getAppointmentHandler(req, res) {
  const { id } = req.params;
  const record = getAppointmentById(id);
  if (!record) {
    return res.status(404).json({ error: "Không tìm thấy lịch hẹn." });
  }
  return res.status(200).json({ data: toPublicRecord(record) });
}

/** GET /api/appointments  (admin only) */
export async function listAppointmentsHandler(req, res) {
  const { status, page, limit } = req.query;
  const result = getAllAppointments({ status, page, limit });
  return res.status(200).json(result);
}

/** PATCH /api/appointments/:id/status  (admin only) */
export async function updateStatusHandler(req, res) {
  const { id } = req.params;
  const { status } = req.body ?? {};

  if (!status) {
    return res.status(400).json({ error: "Trường 'status' là bắt buộc." });
  }

  const result = updateAppointmentStatus(id, status);
  if (result.error) {
    const code = result.error.includes("không tìm thấy") ? 404 : 400;
    return res.status(code).json({ error: result.error });
  }
  return res.status(200).json({ data: result.record });
}

/** PATCH /api/appointments/:id/cancel  (public) */
export async function cancelAppointmentHandler(req, res) {
  const { id } = req.params;
  const result = cancelAppointment(id);
  if (result.error) {
    const code = result.error.includes("không tìm thấy") ? 404 : 400;
    return res.status(code).json({ error: result.error });
  }
  return res.status(200).json({ data: toPublicRecord(result.record) });
}
