import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import AdminAccessGate from './components/AdminAccessGate.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

const PAGES = {
  LANDING: 'landing',
  CHAT: 'chat',
  BOOKING: 'booking',
  ADMIN: 'admin',
};

// Ánh xạ URL hash <-> trang, giúp mỗi trang (đặc biệt là trang quản trị/dashboard)
// có một đường link riêng có thể lưu lại hoặc chia sẻ trực tiếp, ví dụ:
// https://<domain>/<base>/#admin
const HASH_TO_PAGE = {
  '': PAGES.LANDING,
  '#landing': PAGES.LANDING,
  '#chat': PAGES.CHAT,
  '#booking': PAGES.BOOKING,
  '#admin': PAGES.ADMIN,
};

const PAGE_TO_HASH = {
  [PAGES.LANDING]: '',
  [PAGES.CHAT]: '#chat',
  [PAGES.BOOKING]: '#booking',
  [PAGES.ADMIN]: '#admin',
};

function getPageFromHash() {
  return HASH_TO_PAGE[window.location.hash] || PAGES.LANDING;
}

export default function App() {
  const [currentPage, setCurrentPageState] = useState(getPageFromHash);

  // Đồng bộ state -> URL hash, để trang hiện tại luôn có link tương ứng.
  const setCurrentPage = useCallback((page) => {
    setCurrentPageState(page);
    const nextHash = PAGE_TO_HASH[page] ?? '';
    if (window.location.hash !== nextHash) {
      if (nextHash) {
        window.location.hash = nextHash;
      } else {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }, []);

  // Đồng bộ URL hash -> state, để link dán thẳng vào trình duyệt (hoặc nút back/forward)
  // cũng mở đúng trang.
  useEffect(() => {
    function handleHashChange() {
      setCurrentPageState(getPageFromHash());
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="app">
      {currentPage !== PAGES.LANDING && (
        <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      )}
      <main
        className={
          currentPage === PAGES.LANDING ? 'app-main app-main--full' : 'app-main'
        }
      >
        {currentPage === PAGES.LANDING && (
          <LandingPage onEnterChat={() => setCurrentPage(PAGES.CHAT)} />
        )}
        {currentPage === PAGES.CHAT && (
          <ChatPage onRequestBooking={() => setCurrentPage(PAGES.BOOKING)} />
        )}
        {currentPage === PAGES.BOOKING && <BookingPage />}
        {currentPage === PAGES.ADMIN && (
          <AdminAccessGate>
            <AdminPage />
          </AdminAccessGate>
        )}
      </main>
    </div>
  );
}
