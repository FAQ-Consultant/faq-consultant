
import { products } from "../data/product.js";
import {
  warrantyPolicy,
  deliveryPolicy,
  bulkDiscountPolicy,
} from "../data/policies.js";
import { faqKnowledge } from "../data/faqKnowledge.js";

// FAQ tương ứng với từng ý định.
const FAQ_BY_INTENT = {
  general: ["FAQ001"],
  product_search: ["FAQ002"],
  consultation: ["FAQ007"],
  comparison: ["FAQ008", "FAQ009"],
  purchasing: ["FAQ010"],
  warranty: ["FAQ011"],
  delivery: ["FAQ012", "FAQ013"],
  bulk_discount: ["FAQ014"],
};

const PRODUCT_FAQ_MAP = {
  "MP-KB16": "FAQ003",
  "MP-TC400": "FAQ004",
  "MP-CNC650": "FAQ005",
  "MP-KN15": "FAQ006",
};

function uniqueItems(items) {
  return [...new Set(items)];
}

function hasData(value) {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length > 0;
  }

  return Boolean(value);
}

// ======================================================
// LẤY SẢN PHẨM PHÙ HỢP
// ======================================================

function getSelectedProducts(analysis) {
  const productIds = Array.isArray(analysis.productIds)
    ? analysis.productIds
    : [];

  const intents = analysis.intents || [];

  const productMention =
    typeof analysis.productMention === "string"
      ? analysis.productMention.trim()
      : "";

  const matchedProducts = products.filter((product) =>
    productIds.includes(product.id)
  );

  // Nếu khách đã nhắc đến sản phẩm cụ thể nhưng
  // không tìm thấy sản phẩm tương ứng trong danh mục,
  // tuyệt đối không trả về toàn bộ danh mục.
  if (productMention && matchedProducts.length === 0) {
    return [];
  }

  // Nếu khách hỏi chung về danh mục sản phẩm
  // hoặc cần tư vấn chọn máy, có thể dùng toàn bộ danh mục.
  const needsProductCatalog =
    intents.includes("product_search") ||
    intents.includes("consultation");

  if (matchedProducts.length === 0 && needsProductCatalog) {
    return products;
  }

  return matchedProducts;
}

// ======================================================
// LẤY FAQ
// ======================================================

function getSelectedFaqs(intents, selectedProducts) {
  const faqIds = [];

  for (const intent of intents) {
    faqIds.push(...(FAQ_BY_INTENT[intent] || []));
  }

  for (const product of selectedProducts) {
    const faqId = PRODUCT_FAQ_MAP[product.id];

    if (faqId) {
      faqIds.push(faqId);
    }
  }

  const selectedIds = uniqueItems(faqIds);

  return faqKnowledge.filter((faq) =>
    selectedIds.includes(faq.id)
  );
}

// ======================================================
// LẤY CHÍNH SÁCH
// ======================================================

function getSelectedPolicies(intents) {
  const selectedPolicies = {};

  if (intents.includes("warranty")) {
    selectedPolicies.warranty = warrantyPolicy;
  }

  if (intents.includes("delivery")) {
    selectedPolicies.delivery = deliveryPolicy;
  }

  if (intents.includes("bulk_discount")) {
    selectedPolicies.bulkDiscount = bulkDiscountPolicy;
  }

  return selectedPolicies;
}

// ======================================================
// KIỂM TRA FAQ
// ======================================================

function hasIntentFaq(intent, selectedFaqs) {
  const faqIds = FAQ_BY_INTENT[intent] || [];

  return selectedFaqs.some((faq) =>
    faqIds.includes(faq.id)
  );
}

// ======================================================
// KIỂM TRA DỮ LIỆU SẢN PHẨM
// ======================================================

function hasRequiredProductData(intent, selectedProducts) {
  if (selectedProducts.length === 0) {
    return false;
  }

  return selectedProducts.every((product) => {
    switch (intent) {
      case "price":
        return (
          typeof product.price === "number" &&
          Number.isFinite(product.price) &&
          hasData(product.currency)
        );

      case "inventory":
        return (
          product.inventory &&
          Number.isFinite(product.inventory.quantity) &&
          hasData(product.inventory.status)
        );

      case "specifications":
        return hasData(product.specifications);

      default:
        return false;
    }
  });
}

// ======================================================
// KIỂM TRA KIẾN THỨC
// ======================================================

function hasRequiredKnowledge({
  intents,
  selectedProducts,
  selectedFaqs,
  selectedPolicies,
}) {
  const checks = {
    price: () =>
      hasRequiredProductData("price", selectedProducts),

    inventory: () =>
      hasRequiredProductData("inventory", selectedProducts),

    specifications: () =>
      hasRequiredProductData("specifications", selectedProducts),

    product_search: () =>
      selectedProducts.length > 0,

    consultation: () =>
      selectedProducts.length > 0,

    comparison: () =>
      selectedProducts.length >= 2,

    warranty: () =>
      hasData(selectedPolicies.warranty) ||
      hasIntentFaq("warranty", selectedFaqs),

    delivery: () =>
      hasData(selectedPolicies.delivery) ||
      hasIntentFaq("delivery", selectedFaqs),

    bulk_discount: () =>
      hasData(selectedPolicies.bulkDiscount) ||
      hasIntentFaq("bulk_discount", selectedFaqs),

    general: () =>
      hasIntentFaq("general", selectedFaqs),

    purchasing: () =>
      hasIntentFaq("purchasing", selectedFaqs),
  };

  const relevantChecks = intents
    .filter((intent) => checks[intent])
    .map((intent) => checks[intent]);

  if (relevantChecks.length === 0) {
    return false;
  }

  return relevantChecks.every((check) => check());
}

// ======================================================
// TẠO CÂU TRẢ LỜI DỰ PHÒNG
// ======================================================

function buildFallbackAnswer({
  intents,
  selectedProducts,
  selectedFaqs,
  selectedPolicies,
}) {
  if (selectedProducts.length > 0) {
    const productNames = selectedProducts
      .map((product) => product.name)
      .join(", ");

    if (intents.includes("consultation")) {
      return `Minh Phát hiện có các sản phẩm sau: ${productNames}. Bạn có thể cho mình biết mục đích sử dụng, vật liệu gia công và quy mô xưởng để được tư vấn phù hợp hơn nhé.`;
    }

    if (intents.includes("comparison")) {
      return `Mình đã tìm thấy thông tin về ${productNames}. Bạn muốn so sánh về công dụng, thông số kỹ thuật hay mức giá?`;
    }

    return `Mình đã tìm thấy thông tin về ${productNames}. Bạn muốn tìm hiểu thêm nội dung nào?`;
  }

  if (selectedPolicies.warranty) {
    return "Minh Phát có chính sách bảo hành cho các sản phẩm. Bạn muốn tìm hiểu điều kiện bảo hành hay trường hợp không được bảo hành?";
  }

  if (selectedPolicies.delivery) {
    return "Minh Phát hỗ trợ giao hàng trên toàn quốc. Thời gian và chi phí giao hàng phụ thuộc vào địa điểm nhận hàng và loại thiết bị.";
  }

  if (selectedPolicies.bulkDiscount) {
    return "Minh Phát có chính sách chiết khấu theo số lượng đặt hàng. Bạn dự kiến mua bao nhiêu sản phẩm?";
  }

  if (selectedFaqs.length > 0) {
    return selectedFaqs[0].answer;
  }

  return null;
}

// ======================================================
// HÀM TRUY XUẤT DỮ LIỆU CHÍNH
// ======================================================

export function getStructuredKnowledge(message, analysis) {
  if (!analysis || !Array.isArray(analysis.intents)) {
    return {
      context: null,
      answer: null,
      hasKnowledge: false,
    };
  }

  const intents = analysis.intents;

  const selectedProducts = getSelectedProducts(analysis);

  const selectedFaqs = getSelectedFaqs(
    intents,
    selectedProducts
  );

  const selectedPolicies = getSelectedPolicies(intents);

  const hasKnowledge = hasRequiredKnowledge({
    intents,
    selectedProducts,
    selectedFaqs,
    selectedPolicies,
  });

  if (!hasKnowledge) {
    return {
      context: null,
      answer: null,
      hasKnowledge: false,
      intents,
    };
  }

  const verifiedKnowledge = {
    company: "Minh Phát",
    customerQuestion: message,
    customerIntents: intents,
    customerProductMention: analysis.productMention || "",
    customerEntities: analysis.entities || {},
    products: selectedProducts,
    relevantKnowledge: selectedFaqs,
    policies: selectedPolicies,
  };

  return {
    context: JSON.stringify(verifiedKnowledge, null, 2),

    answer: buildFallbackAnswer({
      intents,
      selectedProducts,
      selectedFaqs,
      selectedPolicies,
    }),

    hasKnowledge: true,
    intents,
    products: selectedProducts,
    faqs: selectedFaqs,
    policies: selectedPolicies,
  };
}
