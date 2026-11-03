import { useState } from 'react';
import { hasAdminAccess, grantAdminAccess, checkAdminCode } from '../utils/adminAccess.js';

export default function AdminAccessGate({ children }) {
  const [unlocked, setUnlocked] = useState(hasAdminAccess());
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (checkAdminCode(code)) {
      grantAdminAccess();
      setUnlocked(true);
      setError('');
    } else {
      setError('Mã truy cập không đúng. Vui lòng thử lại.');
    }
  }

  if (unlocked) {
    return children;
  }

  return (
    <section className="admin-gate">
      <h1 className="admin-gate__title">Khu vực quản trị</h1>
      <p className="admin-gate__subtitle">
        Vui lòng nhập mã truy cập để xem danh sách lịch hẹn.
      </p>

      <form className="admin-gate__form" onSubmit={handleSubmit}>
        <input
          type="password"
          className="admin-gate__input"
          placeholder="Nhập mã truy cập"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          autoFocus
        />
        <button type="submit" className="admin-gate__submit-btn">
          Xác nhận
        </button>
      </form>

      {error && <p className="admin-gate__error">{error}</p>}
    </section>
  );
}
