// Tiện ích xử lý ngày giờ cho lịch hẹn tư vấn.

export function getTodayISODate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isSameSlot(appointment, date, time) {
  return appointment.date === date && appointment.time === time;
}

export function hasConflictingSlot(appointments, date, time, excludeId) {
  return appointments.some(
    (appt) =>
      appt.id !== excludeId &&
      appt.status !== 'done' &&
      isSameSlot(appt, date, time)
  );
}

export function formatDateDisplay(date) {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return date;
  return `${day}/${month}/${year}`;
}

export function formatDateTimeDisplay(date, time) {
  const displayDate = formatDateDisplay(date);
  return time ? `${displayDate} lúc ${time}` : displayDate;
}

export function sortAppointmentsByDateTime(appointments) {
  return [...appointments].sort((a, b) => {
    const left = `${a.date}T${a.time}`;
    const right = `${b.date}T${b.time}`;
    return left.localeCompare(right);
  });
}

// Lich hen co dung ngay hom nay khong (dung de highlight tren dashboard).
export function isToday(date) {
  return date === getTodayISODate();
}

// Lich hen co roi vao khoang "trong N ngay toi" khong (tinh ca hom nay),
// khong tinh cac ngay da qua. Dung de highlight lich hen sap toi va de
// tinh so lieu tong quan tren dashboard.
export function isWithinDays(date, days) {
  if (!date) return false;
  const today = new Date(getTodayISODate());
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) return false;
  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
  return diffDays >= 0 && diffDays < days;
}
