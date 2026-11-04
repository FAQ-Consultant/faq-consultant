const NAV_ITEMS = [
  { key: 'landing', label: 'Trang chủ' },
  { key: 'chat', label: 'Hỏi đáp' },
  { key: 'booking', label: 'Đặt lịch tư vấn' },
  { key: 'admin', label: 'Quản trị' },
];

export default function Header({ currentPage, onNavigate }) {
  return (
    <header className="app-header">
      <div className="app-header__brand">FAQ Chatbot &amp; Đặt lịch tư vấn</div>
      <nav className="app-header__nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={
              'app-header__nav-btn' +
              (currentPage === item.key ? ' app-header__nav-btn--active' : '')
            }
            onClick={() => onNavigate(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
