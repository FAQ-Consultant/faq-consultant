// Mã truy cập trang quản trị — chỉ là lớp bảo vệ đơn giản phía giao diện
// cho bản demo (frontend chưa có hệ thống đăng nhập/backend xác thực).
// KHÔNG phải cơ chế bảo mật thực sự: mã được lưu ở dạng rõ trong mã nguồn
// front-end nên không ngăn được người dùng có kỹ thuật xem mã nguồn.
export const ADMIN_ACCESS_CODE = 'DAIDIACHAN-ADMIN-2024';

const SESSION_KEY = 'admin_access_granted';

export function hasAdminAccess() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function grantAdminAccess() {
  try {
    sessionStorage.setItem(SESSION_KEY, 'true');
  } catch {
    // sessionStorage không khả dụng (ví dụ chế độ ẩn danh) — bỏ qua,
    // người dùng vẫn truy cập được trong phiên hiện tại nhờ state ở React.
  }
}

export function checkAdminCode(code) {
  return code.trim() === ADMIN_ACCESS_CODE;
}
