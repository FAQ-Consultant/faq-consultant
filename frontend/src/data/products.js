// Bộ dữ liệu sản phẩm mẫu (giả lập) của Công ty Máy móc Minh Phát.
// Dùng để hiển thị trên Giao diện bên ngoài (LandingPage) — KHÔNG dùng để
// thay đổi logic trả lời của chatbot (phần đó thuộc kho tri thức FAQ hiện có).
// Toàn bộ thông tin dưới đây là dữ liệu giả lập phục vụ demo, không đại diện
// cho một doanh nghiệp có thật.

export const companyInfo = {
  name: 'MINH PHÁT',
  tagline: 'Máy móc cho tương lai',
  headline: 'Giải pháp máy móc công nghiệp hiệu quả cho doanh nghiệp Việt',
  subheadline: 'Chất lượng vượt trội · Tư vấn chuyên nghiệp · Hỗ trợ toàn diện',
};

export const products = [
  {
    id: 'machine-001',
    name: 'Máy khoan bàn MP-KB16',
    shortDescription: 'Khoan chính xác, hiệu quả cao',
    price: 8500000,
    stock: 12,
    power: '750W',
    warrantyMonths: 12,
  },
  {
    id: 'machine-002',
    name: 'Máy tiện cơ khí MP-TC400',
    shortDescription: 'Gia công kim loại chuyên nghiệp',
    price: 68000000,
    stock: 5,
    power: '2200W',
    warrantyMonths: 12,
  },
  {
    id: 'machine-003',
    name: 'Máy phay CNC MP-CNC650',
    shortDescription: 'Công nghệ hiện đại, độ chính xác cao',
    price: 485000000,
    stock: 2,
    power: '7500W',
    warrantyMonths: 24,
  },
  {
    id: 'machine-004',
    name: 'Máy nén khí công nghiệp MP-KN15',
    shortDescription: 'Cung cấp khí nén ổn định',
    price: 32000000,
    stock: 8,
    power: '11000W',
    warrantyMonths: 12,
  },
];

export const trustBadges = [
  { title: 'Bảo hành chính hãng', detail: 'Cam kết 12–24 tháng' },
  { title: 'Giao hàng toàn quốc', detail: 'Nhanh chóng, đúng hẹn' },
  { title: 'Tư vấn chuyên nghiệp', detail: 'Hỗ trợ 24/7' },
  { title: 'Giá cả cạnh tranh', detail: 'Ưu đãi hấp dẫn' },
];

// Noi dung chinh sach gia lap, phuc vu demo (chua phai chinh sach thuc te).
export const policies = [
  {
    title: 'Chính sách bảo hành',
    detail:
      'Bảo hành chính hãng 12–24 tháng tùy dòng sản phẩm, hỗ trợ kiểm tra và sửa chữa tại trung tâm bảo hành trên toàn quốc.',
  },
  {
    title: 'Chính sách đổi trả',
    detail:
      'Đổi mới miễn phí trong vòng 7 ngày nếu phát hiện lỗi kỹ thuật từ nhà sản xuất, kèm biên bản kiểm tra của kỹ thuật viên.',
  },
  {
    title: 'Chính sách vận chuyển',
    detail:
      'Giao hàng toàn quốc qua đối tác vận chuyển, miễn phí giao hàng nội thành trong bán kính 20km kể từ kho gần nhất.',
  },
  {
    title: 'Chính sách thanh toán',
    detail:
      'Hỗ trợ thanh toán chuyển khoản, tiền mặt khi nhận hàng, hoặc trả góp 0% lãi suất qua đối tác tài chính liên kết.',
  },
];

export function formatPriceVnd(price) {
  return `${price.toLocaleString('vi-VN')} đ`;
}

// >5 máy = còn hàng; 1-5 = số lượng hạn chế; 0 = hết hàng
export function getStockStatus(stock) {
  if (stock > 5) return 'Còn hàng';
  if (stock > 0) return 'Số lượng hạn chế';
  return 'Hết hàng';
}
