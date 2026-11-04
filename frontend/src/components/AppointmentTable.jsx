import { useState } from 'react';
import { formatDateTimeDisplay, isToday, isWithinDays } from '../utils/dateTime.js';
import { validateName, validatePhone, validateDate, validateTime } from '../utils/validators.js';

function validateEditForm({ name, phone, date, time }) {
  const errors = {
    name: validateName(name),
    phone: validatePhone(phone),
    date: validateDate(date),
    time: validateTime(time),
  };
  const isValid = Object.values(errors).every((message) => !message);
  return { isValid, errors };
}

// Dang bang cua danh sach lich hen - thay the cho dang the (card) khi
// danh sach dai, giup quet mat nhanh hon tren man hinh rong.
export default function AppointmentTable({ appointments, onMarkDone, onUndo, onDelete, onEdit }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});

  function startEditing(appt) {
    setEditingId(appt.id);
    setForm({ name: appt.name, phone: appt.phone, date: appt.date, time: appt.time, note: appt.note || '' });
    setErrors({});
  }

  function cancelEditing() {
    setEditingId(null);
    setForm(null);
    setErrors({});
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave(event, id) {
    event.preventDefault();
    const { isValid, errors: nextErrors } = validateEditForm(form);
    setErrors(nextErrors);
    if (!isValid) return;
    onEdit(id, form);
    cancelEditing();
  }

  function handleDelete(appt) {
    const confirmed = window.confirm(
      `Xóa lịch hẹn của "${appt.name}"? Thao tác này không thể hoàn tác.`
    );
    if (confirmed) {
      onDelete(appt.id);
    }
  }

  return (
    <div className="appointment-table-wrap">
      <table className="appointment-table">
        <thead>
          <tr>
            <th>Tên</th>
            <th>SĐT</th>
            <th>Ngày giờ</th>
            <th>Ghi chú</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt) => {
            const isDone = appt.status === 'done';
            const highlightToday = !isDone && isToday(appt.date);
            const highlightUpcoming = !isDone && !highlightToday && isWithinDays(appt.date, 3);

            if (editingId === appt.id) {
              return (
                <tr key={appt.id} className="appointment-table__row--editing">
                  <td colSpan={6}>
                    <form className="appointment-table__edit-form" onSubmit={(event) => handleSave(event, appt.id)} noValidate>
                      <div className="appointment-card__edit-grid">
                        <div className="appointment-card__edit-field">
                          <label htmlFor={`t-name-${appt.id}`}>Họ và tên</label>
                          <input
                            id={`t-name-${appt.id}`}
                            type="text"
                            value={form.name}
                            onChange={(event) => handleChange('name', event.target.value)}
                          />
                          {errors.name && <p className="booking-form__error">{errors.name}</p>}
                        </div>
                        <div className="appointment-card__edit-field">
                          <label htmlFor={`t-phone-${appt.id}`}>Số điện thoại</label>
                          <input
                            id={`t-phone-${appt.id}`}
                            type="tel"
                            value={form.phone}
                            onChange={(event) => handleChange('phone', event.target.value)}
                          />
                          {errors.phone && <p className="booking-form__error">{errors.phone}</p>}
                        </div>
                        <div className="appointment-card__edit-field">
                          <label htmlFor={`t-date-${appt.id}`}>Ngày</label>
                          <input
                            id={`t-date-${appt.id}`}
                            type="date"
                            value={form.date}
                            onChange={(event) => handleChange('date', event.target.value)}
                          />
                          {errors.date && <p className="booking-form__error">{errors.date}</p>}
                        </div>
                        <div className="appointment-card__edit-field">
                          <label htmlFor={`t-time-${appt.id}`}>Giờ</label>
                          <input
                            id={`t-time-${appt.id}`}
                            type="time"
                            value={form.time}
                            onChange={(event) => handleChange('time', event.target.value)}
                          />
                          {errors.time && <p className="booking-form__error">{errors.time}</p>}
                        </div>
                        <div className="appointment-card__edit-field appointment-card__edit-field--full">
                          <label htmlFor={`t-note-${appt.id}`}>Ghi chú</label>
                          <textarea
                            id={`t-note-${appt.id}`}
                            rows={2}
                            value={form.note}
                            onChange={(event) => handleChange('note', event.target.value)}
                          />
                        </div>
                      </div>
                      <div className="appointment-card__edit-actions">
                        <button type="submit" className="appointment-card__btn appointment-card__btn--primary">
                          Lưu
                        </button>
                        <button type="button" className="appointment-card__btn" onClick={cancelEditing}>
                          Hủy
                        </button>
                      </div>
                    </form>
                  </td>
                </tr>
              );
            }

            return (
              <tr
                key={appt.id}
                className={
                  (isDone ? 'appointment-table__row--done ' : '') +
                  (highlightToday ? 'appointment-table__row--today ' : '') +
                  (highlightUpcoming ? 'appointment-table__row--upcoming ' : '')
                }
              >
                <td data-label="Tên">{appt.name}</td>
                <td data-label="SĐT">{appt.phone}</td>
                <td data-label="Ngày giờ">
                  {formatDateTimeDisplay(appt.date, appt.time)}
                  {highlightToday && <span className="appointment-card__tag">Hôm nay</span>}
                  {highlightUpcoming && <span className="appointment-card__tag appointment-card__tag--soon">Sắp tới</span>}
                </td>
                <td data-label="Ghi chú">{appt.note || '—'}</td>
                <td data-label="Trạng thái">
                  <span className={'appointment-card__badge' + (isDone ? ' appointment-card__badge--done' : '')}>
                    {isDone ? 'Đã xử lý' : 'Chờ xử lý'}
                  </span>
                </td>
                <td data-label="Thao tác">
                  <div className="appointment-table__actions">
                    {!isDone && (
                      <button type="button" className="appointment-card__btn" onClick={() => onMarkDone(appt.id)}>
                        Xử lý xong
                      </button>
                    )}
                    {isDone && (
                      <button type="button" className="appointment-card__btn" onClick={() => onUndo(appt.id)}>
                        Hoàn tác
                      </button>
                    )}
                    <button type="button" className="appointment-card__btn" onClick={() => startEditing(appt)}>
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="appointment-card__btn appointment-card__btn--danger"
                      onClick={() => handleDelete(appt)}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
