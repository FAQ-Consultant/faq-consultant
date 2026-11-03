import { useState } from 'react';
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

export default function App() {
  const [currentPage, setCurrentPage] = useState(PAGES.LANDING);

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
