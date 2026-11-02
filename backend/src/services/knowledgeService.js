export function calculateBulkPrice(price, quantity, stock) {
  if (quantity <= 0) {
    throw new Error("Số lượng không hợp lệ");
  }

  if (quantity > stock) {
    return {
      available: false,
      message: "Số lượng đặt vượt quá tồn kho."
    };
  }

  let discount = null;

  if (quantity === 1) discount = 0;
  else if (quantity <= 3) discount = 2;
  else if (quantity <= 5) discount = 3;
  else if (quantity <= 9) discount = 5;

  if (discount === null) {
    return {
      available: true,
      requiresConsultation: true,
      message: "Đơn hàng từ 10 máy cần thỏa thuận riêng."
    };
  }

  const subtotal = price * quantity;
  const discountAmount = subtotal * discount / 100;

  return {
    available: true,
    quantity,
    discount,
    subtotal,
    discountAmount,
    total: subtotal - discountAmount
  };
}