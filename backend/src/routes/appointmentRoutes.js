import { Router } from "express";
import {
  cancelAppointmentHandler,
  createAppointmentHandler,
  getAppointmentHandler,
  listAppointmentsHandler,
  updateStatusHandler,
} from "../controllers/appointmentController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const appointmentRoutes = Router();

// Public
appointmentRoutes.post("/appointments", createAppointmentHandler);
appointmentRoutes.get("/appointments/:id", getAppointmentHandler);
appointmentRoutes.patch("/appointments/:id/cancel", cancelAppointmentHandler);

// Admin only
appointmentRoutes.get("/appointments", adminAuth, listAppointmentsHandler);
appointmentRoutes.patch("/appointments/:id/status", adminAuth, updateStatusHandler);

export default appointmentRoutes;
