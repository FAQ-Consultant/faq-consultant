// Lưu và truy xuất lịch hẹn tư vấn bằng localStorage (bản demo).
// Mỗi lịch hẹn: { id, name, phone, date, time, status, note, createdAt }
// status: 'pending' | 'done'

const STORAGE_KEY = 'faq_consultant_appointments';

function readAll() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Không đọc được lịch hẹn từ localStorage:', error);
    return [];
  }
}

function writeAll(appointments) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  } catch (error) {
    console.error('Không lưu được lịch hẹn vào localStorage:', error);
  }
}

export function getAppointments() {
  return readAll();
}

export function createAppointment({ name, phone, date, time, note }) {
  const appointments = readAll();
  const appointment = {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `appt_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    name: name.trim(),
    phone: phone.trim(),
    date,
    time,
    status: 'pending',
    note: note ? note.trim() : '',
    createdAt: new Date().toISOString(),
  };
  appointments.push(appointment);
  writeAll(appointments);
  return appointment;
}

export function updateAppointmentStatus(id, status) {
  const appointments = readAll();
  const next = appointments.map((appt) =>
    appt.id === id ? { ...appt, status } : appt
  );
  writeAll(next);
  return next;
}

// Cap nhat thong tin lich hen da ton tai (dung khi admin sua lai thong tin
// nhap sai). Chi ghi de cac truong duoc truyen vao qua `patch`.
export function updateAppointment(id, patch) {
  const appointments = readAll();
  const next = appointments.map((appt) => {
    if (appt.id !== id) return appt;
    return {
      ...appt,
      ...patch,
      name: patch.name !== undefined ? patch.name.trim() : appt.name,
      phone: patch.phone !== undefined ? patch.phone.trim() : appt.phone,
      note: patch.note !== undefined ? patch.note.trim() : appt.note,
    };
  });
  writeAll(next);
  return next;
}

export function deleteAppointment(id) {
  const appointments = readAll();
  const next = appointments.filter((appt) => appt.id !== id);
  writeAll(next);
  return next;
}
