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

// Các intent bắt buộc phải có dữ liệu sản phẩm tương ứng.
const PRODUCT_DATA_INTENTS = [
  "price",
  "inventory",
  "specifications",
];

function uniqueItems(items) {
  return [...new Set(items)];
}

// Kiểm tra dữ liệu có thực sự tồn tại hay không.
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

function getSelectedProducts(analysis) {
  const productIds = Array.isArray(analysis.productIds)
    ? analysis.productIds
    : [];

  const intents = analysis.intents || [];

  const matchedProducts = products.filter((product) =>
    productIds.includes(product.id)
  );

  // Với câu hỏi tìm kiếm danh mục hoặc tư vấn chọn máy,
  // cung cấp danh mục sản phẩm để Gemini hỗ trợ.
  const needsProductCatalog =
    intents.includes("product_search") ||
    intents.includes("consultation");

  if (matchedProducts.length === 0 && needsProductCatalog) {
    return products;
  }

  return matchedProducts;
}

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

// Chỉ kiểm tra FAQ được chọn trực tiếp theo intent.
// FAQ hướng dẫn sử dụng sản phẩm không được dùng để
// chứng minh rằng đã có giá hoặc tồn kho.
function hasIntentFaq(intent, selectedFaqs) {
  const faqIds = FAQ_BY_INTENT[intent] || [];

  return selectedFaqs.some((faq) =>
    faqIds.includes(faq.id)
  );
}

// Kiểm tra dữ liệu sản phẩm theo đúng câu hỏi.
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

// Xác định có đủ dữ liệu để trả lời tất cả ý định hay không.
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

  // Chỉ xét các intent có quy tắc kiểm tra tương ứng.
  const relevantChecks = intents
    .filter((intent) => checks[intent])
    .map((intent) => checks[intent]);

  if (relevantChecks.length === 0) {
    return false;
  }

  // Tất cả nội dung khách hỏi đều phải có dữ liệu.
  return relevantChecks.every((check) => check());
}

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

  // Kiểm tra dữ liệu cần thiết thay vì chỉ kiểm tra
  // xem có tìm thấy sản phẩm hoặc FAQ hay không.
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