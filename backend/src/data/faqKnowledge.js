
export const faqKnowledge = [
  // 1. GIỚI THIỆU DOANH NGHIỆP
  {
    id: "FAQ001",
    category: "company",
    topic: "Giới thiệu Minh Phát",
    question: "Minh Phát kinh doanh lĩnh vực gì?",
    answer:
      "Minh Phát cung cấp các dòng máy móc công nghiệp và thiết bị phục vụ gia công cơ khí, sản xuất và hệ thống khí nén.",
    tags: ["Minh Phát", "công ty", "máy móc công nghiệp"]
  },

  // 2. DANH MỤC SẢN PHẨM
  {
    id: "FAQ002",
    category: "product_catalog",
    topic: "Danh mục sản phẩm",
    question: "Minh Phát hiện có những loại máy nào?",
    answer:
      "Danh mục sản phẩm gồm máy khoan bàn MP-KB16, máy tiện cơ khí MP-TC400, máy phay CNC MP-CNC650 và máy nén khí công nghiệp MP-KN15.",
    relatedProducts: [
      "MP-KB16",
      "MP-TC400",
      "MP-CNC650",
      "MP-KN15"
    ],
    tags: ["danh mục", "sản phẩm", "các loại máy"]
  },

  // 3. MÁY KHOAN BÀN
  {
    id: "FAQ003",
    category: "product_knowledge",
    topic: "Máy khoan bàn",
    question: "Máy khoan bàn MP-KB16 dùng để làm gì?",
    answer:
      "Máy khoan bàn MP-KB16 được sử dụng để khoan kim loại, phục vụ hoạt động gia công cơ khí nhỏ và vừa.",
    relatedProducts: ["MP-KB16"],
    tags: ["máy khoan", "khoan kim loại", "gia công cơ khí"]
  },

  // 4. MÁY TIỆN CƠ KHÍ
  {
    id: "FAQ004",
    category: "product_knowledge",
    topic: "Máy tiện cơ khí",
    question: "Máy tiện MP-TC400 có thể thực hiện những công việc gì?",
    answer:
      "Máy tiện cơ khí MP-TC400 phục vụ tiện trụ, tiện mặt đầu và gia công các chi tiết kim loại.",
    relatedProducts: ["MP-TC400"],
    tags: ["máy tiện", "tiện trụ", "tiện mặt đầu"]
  },

  // 5. MÁY PHAY CNC
  {
    id: "FAQ005",
    category: "product_knowledge",
    topic: "Máy phay CNC",
    question: "Máy phay CNC MP-CNC650 dùng để làm gì?",
    answer:
      "Máy phay CNC MP-CNC650 được sử dụng để phay CNC và gia công các chi tiết cơ khí chính xác.",
    relatedProducts: ["MP-CNC650"],
    tags: ["máy phay", "CNC", "gia công chính xác"]
  },

  // 6. MÁY NÉN KHÍ
  {
    id: "FAQ006",
    category: "product_knowledge",
    topic: "Máy nén khí",
    question: "Máy nén khí MP-KN15 có công dụng gì?",
    answer:
      "Máy nén khí công nghiệp MP-KN15 có chức năng cung cấp khí nén cho thiết bị và dây chuyền sản xuất.",
    relatedProducts: ["MP-KN15"],
    tags: ["máy nén khí", "khí nén", "dây chuyền sản xuất"]
  },

  // 7. TƯ VẤN LỰA CHỌN MÁY
  {
    id: "FAQ007",
    category: "consultation",
    topic: "Tư vấn lựa chọn máy",
    question: "Làm thế nào để lựa chọn máy móc phù hợp?",
    answer:
      "Khách hàng nên xác định mục đích sử dụng, loại vật liệu gia công, yêu cầu kỹ thuật và quy mô sản xuất. Minh Phát có thể hỗ trợ tư vấn dựa trên nhu cầu cụ thể.",
    tags: ["tư vấn", "lựa chọn máy", "nhu cầu sản xuất"]
  },

  {
    id: "FAQ008",
    category: "consultation",
    topic: "So sánh máy khoan và máy tiện",
    question: "Máy khoan bàn khác máy tiện cơ khí như thế nào?",
    answer:
      "Máy khoan bàn MP-KB16 phục vụ khoan lỗ trên kim loại. Máy tiện MP-TC400 phục vụ tiện trụ, tiện mặt đầu và gia công chi tiết kim loại. Hai thiết bị có mục đích gia công khác nhau.",
    relatedProducts: ["MP-KB16", "MP-TC400"],
    tags: ["so sánh", "máy khoan", "máy tiện"]
  },

  {
    id: "FAQ009",
    category: "consultation",
    topic: "So sánh máy tiện và máy phay CNC",
    question: "Máy tiện và máy phay CNC khác nhau thế nào?",
    answer:
      "Theo danh mục Minh Phát, máy tiện MP-TC400 phục vụ tiện trụ và tiện mặt đầu; máy phay CNC MP-CNC650 phục vụ phay CNC và gia công chi tiết cơ khí chính xác.",
    relatedProducts: ["MP-TC400", "MP-CNC650"],
    tags: ["so sánh", "máy tiện", "máy phay CNC"]
  },

  // 8. HƯỚNG DẪN MUA HÀNG
  {
    id: "FAQ010",
    category: "purchasing",
    topic: "Thông tin đặt hàng",
    question: "Khi đặt mua máy cần cung cấp thông tin gì?",
    answer:
      "Khách hàng nên cung cấp tên hoặc mã sản phẩm, số lượng cần mua và thông tin địa điểm giao hàng để được hỗ trợ kiểm tra tồn kho, chi phí vận chuyển và tư vấn đơn hàng.",
    tags: ["đặt hàng", "mua máy", "thông tin khách hàng"]
  },

  // 9. BẢO HÀNH
  {
    id: "FAQ011",
    category: "warranty",
    topic: "Điều kiện bảo hành",
    question: "Những trường hợp nào không được bảo hành?",
    answer:
      "Theo chính sách giả định của Minh Phát, không áp dụng bảo hành đối với hư hỏng do sử dụng sai hướng dẫn, thiết bị tự ý tháo lắp hoặc sửa chữa không được cho phép. Linh kiện hao mòn tự nhiên không thuộc phạm vi bảo hành thông thường.",
    tags: ["bảo hành", "điều kiện", "sửa chữa"]
  },

  // 10. GIAO HÀNG VÀ LẮP ĐẶT
  {
    id: "FAQ012",
    category: "delivery",
    topic: "Vận chuyển máy móc",
    question: "Phí vận chuyển máy móc được tính như thế nào?",
    answer:
      "Phí vận chuyển được báo theo địa điểm giao hàng và trọng lượng thiết bị. Đối với máy CNC và máy tiện, chi phí vận chuyển được báo riêng do cần phương tiện chuyên dụng.",
    tags: ["vận chuyển", "phí giao hàng", "máy CNC"]
  },

  {
    id: "FAQ013",
    category: "delivery",
    topic: "Lắp đặt thiết bị",
    question: "Minh Phát có hỗ trợ lắp đặt không?",
    answer:
      "Minh Phát có hỗ trợ lắp đặt thiết bị theo thỏa thuận với khách hàng.",
    tags: ["lắp đặt", "hỗ trợ kỹ thuật"]
  },

  // 11. MUA SỐ LƯỢNG LỚN
  {
    id: "FAQ014",
    category: "bulk_purchase",
    topic: "Chính sách mua số lượng lớn",
    question: "Mua nhiều máy có được chiết khấu không?",
    answer:
      "Minh Phát áp dụng chính sách chiết khấu theo số lượng đặt hàng. Đơn hàng từ 10 máy trở lên cần thỏa thuận riêng với nhân viên kinh doanh.",
    tags: ["chiết khấu", "mua số lượng lớn", "ưu đãi"]
  },

  // 12. NGOÀI PHẠM VI DỮ LIỆU
  {
    id: "FAQ015",
    category: "fallback",
    topic: "Thông tin chưa được xác minh",
    question: "Nếu khách hỏi thông tin chưa có trong dữ liệu thì sao?",
    answer:
      "Hiện tại Minh Phát chưa có thông tin xác minh cho nội dung này. Bạn có thể để lại yêu cầu để nhân viên tư vấn kiểm tra và phản hồi chính xác.",
    tags: ["chưa có dữ liệu", "tư vấn viên", "thông tin"]
  }
];
export const defaultSuggestions = [
  "Minh Phát đang có những loại máy nào?",
  "Máy khoan bàn MP-KB16 giá bao nhiêu?",
  "Chính sách bảo hành của Minh Phát thế nào?"
];