import { useEffect } from 'react';

// Thong bao nho (toast) hien o goc duoi man hinh, tu dong bien mat sau
// vai giay. Dung de xac nhan cac thao tac tren dashboard (danh dau xu ly,
// hoan tac, xoa, sua...) ma khong can alert() lam gian doan thao tac.
export default function Toast({ message, variant = 'success', onDismiss }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onDismiss, 2800);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className={'toast toast--' + variant} role="status">
      {message}
    </div>
  );
}
