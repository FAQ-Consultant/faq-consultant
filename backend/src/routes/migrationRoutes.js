import { Router } from "express";
import { migrateAppointments } from "../controllers/migrationController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const migrationRoutes = Router();

migrationRoutes.post(
  "/migrate/appointments",
  adminAuth,
  migrateAppointments
);

export default migrationRoutes;
