
export const warrantyPolicy = {
  generalConditions: [
    "Bảo hành lỗi kỹ thuật do nhà sản xuất.",
    "Không áp dụng với hư hỏng do sử dụng sai hướng dẫn.",
    "Không áp dụng với thiết bị tự ý tháo lắp hoặc sửa chữa không được cho phép.",
    "Linh kiện hao mòn tự nhiên không nằm trong phạm vi bảo hành thông thường."
  ]
};

export const deliveryPolicy = {
  coverage: "Toàn quốc",

  estimatedDelivery: {
    hanoi: "1–3 ngày làm việc",
    northern: "2–5 ngày làm việc",
    central: "3–7 ngày làm việc",
    southern: "4–8 ngày làm việc"
  },

  shippingFee: "Báo theo địa điểm và trọng lượng",

  installation: "Có hỗ trợ theo thỏa thuận",

  inspection: "Kiểm tra tình trạng thiết bị khi bàn giao",

  specialConditions: [
    "Máy CNC và máy tiện cần phương tiện vận chuyển chuyên dụng.",
    "Chi phí vận chuyển và lắp đặt máy CNC, máy tiện được báo riêng."
  ]
};

export const bulkDiscountPolicy = [
  { min: 1, max: 1, discount: 0 },
  { min: 2, max: 3, discount: 2 },
  { min: 4, max: 5, discount: 3 },
  { min: 6, max: 9, discount: 5 },
  { min: 10, max: null, discount: null }
];
