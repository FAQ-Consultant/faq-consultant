import { useEffect, useMemo, useState } from 'react';
import AppointmentCard from '../components/AppointmentCard.jsx';
import AppointmentTable from '../components/AppointmentTable.jsx';
import Toast from '../components/Toast.jsx';
import {
  getAppointments,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
} from '../services/bookingService.js';
import { sortAppointmentsByDateTime, isWithinDays } from '../utils/dateTime.js';
import { downloadAppointmentsCsv } from '../utils/csv.js';

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xử lý' },
  { key: 'done', label: 'Đã xử lý' },
];

function normalizeForSearch(text) {
  return (text || '').toLowerCase();
}

export default function AdminPage() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('card');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setAppointments(getAppointments());
  }, []);

  function showToast(message, variant = 'success') {
    setToast({ message, variant, key: Date.now() });
  }

  function handleMarkDone(id) {
    const next = updateAppointmentStatus(id, 'done');
    setAppointments(next);
    showToast('Đã đánh dấu lịch hẹn là đã xử lý.');
  }

  function handleUndo(id) {
    const next = updateAppointmentStatus(id, 'pending');
    setAppointments(next);
    showToast('Đã chuyển lịch hẹn về trạng thái chờ xử lý.');
  }

  function handleDelete(id) {
    const next = deleteAppointment(id);
    setAppointments(next);
    showToast('Đã xóa lịch hẹn.', 'danger');
  }

  function handleEdit(id, patch) {
    const next = updateAppointment(id, patch);
    setAppointments(next);
    showToast('Đã lưu thay đổi lịch hẹn.');
  }

  // Loc theo tu khoa tim kiem (ten hoac SDT) truoc, dung lam co so tinh
  // so dem cho tung tab trang thai va cho bo loc trang thai.
  const searchedAppointments = useMemo(() => {
    const keyword = normalizeForSearch(search).trim();
    if (!keyword) return appointments;
    return appointments.filter(
      (appt) =>
        normalizeForSearch(appt.name).includes(keyword) ||
        normalizeForSearch(appt.phone).includes(keyword)
    );
  }, [appointments, search]);

  const counts = useMemo(
    () => ({
      all: searchedAppointments.length,
      pending: searchedAppointments.filter((appt) => appt.status === 'pending').length,
      done: searchedAppointments.filter((appt) => appt.status === 'done').length,
    }),
    [searchedAppointments]
  );

  const filtered = useMemo(() => {
    const byStatus = searchedAppointments.filter((appt) => {
      if (filter === 'all') return true;
      return appt.status === filter;
    });
    return sortAppointmentsByDateTime(byStatus);
  }, [searchedAppointments, filter]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const doneCount = appointments.filter((appt) => appt.status === 'done').length;
    const upcoming = appointments.filter(
      (appt) => appt.status !== 'done' && isWithinDays(appt.date, 7)
    ).length;
    const doneRate = total === 0 ? 0 : Math.round((doneCount / total) * 100);
    return { total, upcoming, doneRate };
  }, [appointments]);

  function handleExportCsv() {
    if (filtered.length === 0) {
      showToast('Không có lịch hẹn nào để xuất.', 'danger');
      return;
    }
    downloadAppointmentsCsv(filtered, 'lich-hen.csv');
    showToast('Đã tải xuống file CSV.');
  }

  return (
    <section className="admin-page">
      <h1 className="admin-page__title">Trang quản trị lịch hẹn</h1>

      <div className="admin-page__stats">
        <div className="admin-page__stat-card">
          <p className="admin-page__stat-value">{stats.total}</p>
          <p className="admin-page__stat-label">Tổng lịch hẹn</p>
        </div>
        <div className="admin-page__stat-card">
          <p className="admin-page__stat-value">{stats.upcoming}</p>
          <p className="admin-page__stat-label">Trong 7 ngày tới</p>
        </div>
        <div className="admin-page__stat-card">
          <p className="admin-page__stat-value">{stats.doneRate}%</p>
          <p className="admin-page__stat-label">Tỉ lệ đã xử lý</p>
        </div>
      </div>

      <div className="admin-page__toolbar">
        <div className="admin-page__filters">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={
                'admin-page__filter-btn' +
                (filter === item.key ? ' admin-page__filter-btn--active' : '')
              }
              onClick={() => setFilter(item.key)}
            >
              {item.label} ({counts[item.key]})
            </button>
          ))}
        </div>

        <input
          type="search"
          className="admin-page__search"
          placeholder="Tìm theo tên hoặc số điện thoại..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="admin-page__view-toggle">
          <button
            type="button"
            className={'admin-page__view-btn' + (view === 'card' ? ' admin-page__view-btn--active' : '')}
            onClick={() => setView('card')}
          >
            Dạng thẻ
          </button>
          <button
            type="button"
            className={'admin-page__view-btn' + (view === 'table' ? ' admin-page__view-btn--active' : '')}
            onClick={() => setView('table')}
          >
            Dạng bảng
          </button>
        </div>

        <button type="button" className="admin-page__export-btn" onClick={handleExportCsv}>
          Xuất CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="admin-page__empty">Không có lịch hẹn nào.</p>
      ) : view === 'table' ? (
        <AppointmentTable
          appointments={filtered}
          onMarkDone={handleMarkDone}
          onUndo={handleUndo}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ) : (
        <div className="admin-page__list">
          {filtered.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              onMarkDone={handleMarkDone}
              onUndo={handleUndo}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      <Toast
        key={toast?.key}
        message={toast?.message}
        variant={toast?.variant}
        onDismiss={() => setToast(null)}
      />
    </section>
  );
}
