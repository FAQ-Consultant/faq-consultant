// Xuat danh sach lich hen ra file CSV de admin tai ve (vi du mo bang Excel).

const CSV_HEADERS = ['Họ và tên', 'Số điện thoại', 'Ngày', 'Giờ', 'Trạng thái', 'Ghi chú'];

function escapeCsvCell(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function appointmentsToCsv(appointments) {
  const rows = appointments.map((appt) => [
    appt.name,
    appt.phone,
    appt.date,
    appt.time,
    appt.status === 'done' ? 'Đã xử lý' : 'Chờ xử lý',
    appt.note || '',
  ]);
  const lines = [CSV_HEADERS, ...rows].map((row) => row.map(escapeCsvCell).join(','));
  // Thêm BOM để Excel đọc đúng tiếng Việt có dấu.
  return '﻿' + lines.join('\r\n');
}

export function downloadAppointmentsCsv(appointments, filename = 'lich-hen.csv') {
  const csvContent = appointmentsToCsv(appointments);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
