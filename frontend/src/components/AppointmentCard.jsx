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

export default function AppointmentCard({ appointment, onMarkDone, onUndo, onDelete, onEdit }) {
  const isDone = appointment.status === 'done';
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: appointment.name,
    phone: appointment.phone,
    date: appointment.date,
    time: appointment.time,
    note: appointment.note || '',
  });
  const [errors, setErrors] = useState({});

  const highlightToday = !isDone && isToday(appointment.date);
  const highlightUpcoming = !isDone && !highlightToday && isWithinDays(appointment.date, 3);

  function startEditing() {
    setForm({
      name: appointment.name,
      phone: appointment.phone,
      date: appointment.date,
      time: appointment.time,
      note: appointment.note || '',
    });
    setErrors({});
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setErrors({});
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave(event) {
    event.preventDefault();
    const { isValid, errors: nextErrors } = validateEditForm(form);
    setErrors(nextErrors);
    if (!isValid) return;
    onEdit(appointment.id, form);
    setIsEditing(false);
  }

  function handleDelete() {
    const confirmed = window.confirm(
      `Xóa lịch hẹn của "${appointment.name}"? Thao tác này không thể hoàn tác.`
    );
    if (confirmed) {
      onDelete(appointment.id);
    }
  }

  if (isEditing) {
    return (
      <form
        className="appointment-card appointment-card--editing"
        onSubmit={handleSave}
        noValidate
      >
        <div className="appointment-card__edit-grid">
          <div className="appointment-card__edit-field">
            <label htmlFor={`name-${appointment.id}`}>Họ và tên</label>
            <input
              id={`name-${appointment.id}`}
              type="text"
              value={form.name}
              onChange={(event) => handleChange('name', event.target.value)}
            />
            {errors.name && <p className="booking-form__error">{errors.name}</p>}
          </div>

          <div className="appointment-card__edit-field">
            <label htmlFor={`phone-${appointment.id}`}>Số điện thoại</label>
            <input
              id={`phone-${appointment.id}`}
              type="tel"
              value={form.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
            />
            {errors.phone && <p className="booking-form__error">{errors.phone}</p>}
          </div>

          <div className="appointment-card__edit-field">
            <label htmlFor={`date-${appointment.id}`}>Ngày</label>
            <input
              id={`date-${appointment.id}`}
              type="date"
              value={form.date}
              onChange={(event) => handleChange('date', event.target.value)}
            />
            {errors.date && <p className="booking-form__error">{errors.date}</p>}
          </div>

          <div className="appointment-card__edit-field">
            <label htmlFor={`time-${appointment.id}`}>Giờ</label>
            <input
              id={`time-${appointment.id}`}
              type="time"
              value={form.time}
              onChange={(event) => handleChange('time', event.target.value)}
            />
            {errors.time && <p className="booking-form__error">{errors.time}</p>}
          </div>

          <div className="appointment-card__edit-field appointment-card__edit-field--full">
            <label htmlFor={`note-${appointment.id}`}>Ghi chú</label>
            <textarea
              id={`note-${appointment.id}`}
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
    );
  }

  return (
    <div
      className={
        'appointment-card' +
        (isDone ? ' appointment-card--done' : '') +
        (highlightToday ? ' appointment-card--today' : '') +
        (highlightUpcoming ? ' appointment-card--upcoming' : '')
      }
    >
      <div className="appointment-card__info">
        <p className="appointment-card__name">{appointment.name}</p>
        <p className="appointment-card__meta">{appointment.phone}</p>
        <p className="appointment-card__meta">
          {formatDateTimeDisplay(appointment.date, appointment.time)}
          {highlightToday && <span className="appointment-card__tag">Hôm nay</span>}
          {highlightUpcoming && <span className="appointment-card__tag appointment-card__tag--soon">Sắp tới</span>}
        </p>
        {appointment.note && <p className="appointment-card__note">Ghi chú: {appointment.note}</p>}
      </div>

      <div className="appointment-card__actions">
        <span className={'appointment-card__badge' + (isDone ? ' appointment-card__badge--done' : '')}>
          {isDone ? 'Đã xử lý' : 'Chờ xử lý'}
        </span>

        {!isDone && (
          <button type="button" className="appointment-card__btn" onClick={() => onMarkDone(appointment.id)}>
            Đánh dấu đã xử lý
          </button>
        )}

        {isDone && (
          <button type="button" className="appointment-card__btn" onClick={() => onUndo(appointment.id)}>
            Hoàn tác
          </button>
        )}

        <button type="button" className="appointment-card__btn" onClick={startEditing}>
          Sửa
        </button>

        <button
          type="button"
          className="appointment-card__btn appointment-card__btn--danger"
          onClick={handleDelete}
        >
          Xóa
        </button>
      </div>
    </div>
  );
}
