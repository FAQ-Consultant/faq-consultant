/**
 * Tests for src/db/appointmentRepository.js
 *
 * Uses an in-memory SQLite database so tests are isolated and fast.
 * Run with: node --test src/__tests__/appointmentRepository.test.js
 */

import { strict as assert } from "assert";
import { describe, it, before, after } from "node:test";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// Bootstrap: create an in-memory DB and override getDb for the test run
// ---------------------------------------------------------------------------
const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We need to set up an in-memory database BEFORE importing the repository so
// that the repository uses it.  We achieve this by monkey-patching the
// database module via a global override.  Since ES modules cache by URL we
// use the DB_PATH env var pointing to ":memory:" so database.js creates a
// fresh in-memory instance.

process.env.DB_PATH = ":memory:";

// Now import the module under test (database.js will use DB_PATH = ':memory:')
const { getDb } = await import("../db/database.js");
const {
  createAppointment,
  getAppointmentById,
  getAllAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  checkConflict,
} = await import("../db/appointmentRepository.js");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function futureDate(daysFromNow = 1) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("appointmentRepository", () => {
  describe("createAppointment — valid input", () => {
    it("creates an appointment and returns it with an id", () => {
      const { record, error } = createAppointment({
        name: "Nguyễn Văn A",
        phone: "0912345678",
        date: futureDate(1),
        time: "09:00",
      });
      assert.ok(!error, `Unexpected error: ${error}`);
      assert.ok(record, "Expected a record");
      assert.ok(record.id, "Expected record.id to be set");
      assert.equal(record.status, "pending");
      assert.equal(record.name, "Nguyễn Văn A");
    });

    it("returns the record via getAppointmentById", () => {
      const { record } = createAppointment({
        name: "Trần Thị B",
        phone: "0987654321",
        date: futureDate(2),
        time: "10:00",
      });
      const fetched = getAppointmentById(record.id);
      assert.ok(fetched, "Record should be retrievable");
      assert.equal(fetched.id, record.id);
    });
  });

  describe("createAppointment — duplicate detection", () => {
    it("rejects a booking on the same date and time slot", () => {
      const date = futureDate(3);
      const time = "11:00";
      const first = createAppointment({
        name: "Lê Văn C",
        phone: "0901234567",
        date,
        time,
      });
      assert.ok(!first.error, "First booking should succeed");

      const second = createAppointment({
        name: "Phạm Thị D",
        phone: "0911111111",
        date,
        time,
      });
      assert.ok(second.error, "Second booking should fail with conflict error");
      assert.match(second.error, /trùng|đã được đặt/i);
    });
  });

  describe("createAppointment — validation errors", () => {
    it("rejects empty name", () => {
      const { error } = createAppointment({
        name: "",
        phone: "0912345678",
        date: futureDate(1),
        time: "09:00",
      });
      assert.ok(error, "Expected validation error for empty name");
    });

    it("rejects invalid phone number", () => {
      const { error } = createAppointment({
        name: "Test User",
        phone: "12345",
        date: futureDate(1),
        time: "09:00",
      });
      assert.ok(error, "Expected validation error for bad phone");
    });

    it("rejects past date", () => {
      const { error } = createAppointment({
        name: "Test User",
        phone: "0912345678",
        date: "2020-01-01",
        time: "09:00",
      });
      assert.ok(error, "Expected validation error for past date");
    });

    it("rejects out-of-hours time", () => {
      const { error } = createAppointment({
        name: "Test User",
        phone: "0912345678",
        date: futureDate(1),
        time: "20:00",
      });
      assert.ok(error, "Expected validation error for time outside business hours");
    });

    it("rejects name longer than 100 characters", () => {
      const { error } = createAppointment({
        name: "A".repeat(101),
        phone: "0912345678",
        date: futureDate(1),
        time: "09:00",
      });
      assert.ok(error, "Expected validation error for name too long");
    });
  });

  describe("cancelAppointment", () => {
    it("sets status to cancelled", () => {
      const { record } = createAppointment({
        name: "Cancel Test",
        phone: "0922222222",
        date: futureDate(4),
        time: "14:00",
      });
      const cancelled = cancelAppointment(record.id);
      assert.ok(!cancelled.error);
      assert.equal(cancelled.record.status, "cancelled");
    });

    it("returns error for non-existent id", () => {
      const result = cancelAppointment("non-existent-id-xyz");
      assert.ok(result.error, "Expected error for non-existent appointment");
    });
  });

  describe("updateAppointmentStatus", () => {
    it("updates status to confirmed", () => {
      const { record } = createAppointment({
        name: "Status Test",
        phone: "0933333333",
        date: futureDate(5),
        time: "08:00",
      });
      const updated = updateAppointmentStatus(record.id, "confirmed");
      assert.ok(!updated.error);
      assert.equal(updated.record.status, "confirmed");
    });

    it("rejects invalid status", () => {
      const { record } = createAppointment({
        name: "Bad Status",
        phone: "0944444444",
        date: futureDate(6),
        time: "16:00",
      });
      const result = updateAppointmentStatus(record.id, "invalid_status");
      assert.ok(result.error);
    });
  });

  describe("getAllAppointments", () => {
    it("returns paginated results", () => {
      const result = getAllAppointments({ page: 1, limit: 5 });
      assert.ok(Array.isArray(result.data));
      assert.ok(typeof result.total === "number");
      assert.equal(result.page, 1);
      assert.equal(result.limit, 5);
    });

    it("filters by status", () => {
      const result = getAllAppointments({ status: "cancelled" });
      assert.ok(result.data.every((r) => r.status === "cancelled"));
    });
  });

  describe("checkConflict", () => {
    it("returns false when slot is free", () => {
      assert.equal(checkConflict(futureDate(20), "09:00"), false);
    });

    it("returns true when slot is taken", () => {
      const date = futureDate(21);
      createAppointment({
        name: "Conflict Check",
        phone: "0955555555",
        date,
        time: "13:00",
      });
      assert.equal(checkConflict(date, "13:00"), true);
    });
  });
});
