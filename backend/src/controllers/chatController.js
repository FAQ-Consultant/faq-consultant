
import { products } from "../data/product.js";

import {
  analyzeCustomerIntent,
  generateConsultantAnswer,
} from "../services/geminiService.js";

import {
  getStructuredKnowledge,
} from "../services/knowledgeService.js";

import {
  buildChatResponse,
} from "../utils/responseBuilder.js";

// ======================================================
// 1. CẤU HÌNH
// ======================================================

const MIN_CONFIDENCE = 0.55;

const UNKNOWN_IN_SCOPE_ANSWER =
  "Hiện tại mình chưa tìm thấy thông tin đã được xác minh trong dữ liệu Minh Phát để trả lời chính xác câu hỏi này. Bạn có thể đặt lịch tư vấn với nhân viên để được hỗ trợ cụ thể hơn nhé.";

const OUT_OF_SCOPE_ANSWER =
  "Mình là trợ lý tư vấn của Minh Phát, hiện hỗ trợ tra cứu sản phẩm, thông số kỹ thuật, giá bán, tồn kho, chính sách và tư vấn mua hàng. Câu hỏi này hiện nằm ngoài phạm vi hỗ trợ của mình. Bạn có thể hỏi mình về máy móc, thiết bị hoặc dịch vụ của Minh Phát nhé.";

const AI_UNAVAILABLE_ANSWER =
  "Hiện tại hệ thống phân tích câu hỏi đang gặp sự cố. Bạn vui lòng thử lại sau ít phút nhé.";

const PRODUCT_SPECIFIC_INTENTS = [
  "price",
  "inventory",
  "specifications",
];

// ======================================================
// 2. CÂU HỎI ĐỀ XUẤT THEO Ý ĐỊNH
// ======================================================

const SUGGESTIONS_BY_INTENT = {
  product_search: [
    "Máy nào phù hợp với nhu cầu của tôi?",
    "Các dòng máy có mức giá như thế nào?",
    "Minh Phát có những chính sách gì?",
  ],

  consultation: [
    "Tôi cần cung cấp thông tin gì để được tư vấn?",
    "Có thể tư vấn máy theo ngân sách không?",
    "Tôi có thể đặt lịch tư vấn không?",
  ],

  comparison: [
    "Sản phẩm nào phù hợp với ngân sách của tôi?",
    "Sự khác biệt về thông số kỹ thuật là gì?",
    "Sản phẩm nào phù hợp với nhu cầu của tôi hơn?",
  ],

  price: [
    "Chính sách bảo hành sản phẩm này thế nào?",
    "Sản phẩm này còn hàng không?",
    "Có ưu đãi khi mua số lượng lớn không?",
  ],

  inventory: [
    "Giá sản phẩm này bao nhiêu?",
    "Thời gian giao hàng dự kiến là bao lâu?",
    "Có thể đặt mua số lượng lớn không?",
  ],

  specifications: [
    "Sản phẩm này phù hợp với công việc nào?",
    "Có dòng máy nào tương tự không?",
    "Giá sản phẩm này bao nhiêu?",
  ],

  warranty: [
    "Thời gian bảo hành cụ thể là bao lâu?",
    "Chính sách giao hàng của Minh Phát thế nào?",
    "Tôi có thể liên hệ nhân viên tư vấn không?",
  ],

  delivery: [
    "Phí giao hàng được tính như thế nào?",
    "Sản phẩm hiện còn hàng không?",
    "Tôi có thể đặt mua số lượng lớn không?",
  ],

  bulk_discount: [
    "Mức chiết khấu được tính như thế nào?",
    "Những sản phẩm nào được áp dụng ưu đãi?",
    "Tôi có thể nhận báo giá không?",
  ],

  purchasing: [
    "Quy trình đặt mua sản phẩm thế nào?",
    "Có hỗ trợ mua số lượng lớn không?",
    "Chính sách giao hàng và thanh toán thế nào?",
  ],

  general: [
    "Minh Phát đang cung cấp những dòng máy nào?",
    "Chính sách bảo hành của Minh Phát thế nào?",
    "Tôi có thể đặt lịch tư vấn không?",
  ],
};

// ======================================================
// 3. NHẬN DIỆN YÊU CẦU ĐẶT LỊCH TRỰC TIẾP
// ======================================================

function hasExplicitBookingIntent(message) {
  if (typeof message !== "string") {
    return false;
  }

  const normalizedMessage = message
    .toLowerCase()
    .normalize("NFC")
    .trim();

  const bookingKeywords = [
    "đặt lịch",
    "đặt hẹn",
    "hẹn lịch",
    "hẹn tư vấn",
    "muốn gặp nhân viên",
    "muốn gặp tư vấn viên",
    "gặp nhân viên tư vấn",
    "gặp tư vấn viên",
    "gặp nhân viên trực tiếp",
    "tư vấn trực tiếp",
    "liên hệ nhân viên",
    "liên hệ tư vấn viên",
    "gọi tư vấn",
    "đăng ký tư vấn",
    "đăng ký lịch tư vấn",
    "đặt lịch gặp",
    "muốn được tư vấn trực tiếp",
    "nhân viên gọi lại",
    "cho nhân viên gọi lại",
    "tôi muốn nhân viên liên hệ",
    "muốn được gọi tư vấn",
  ];

  return bookingKeywords.some((keyword) =>
    normalizedMessage.includes(keyword)
  );
}

// ======================================================
// 4. HÀM HỖ TRỢ
// ======================================================

function getClarificationQuestion(intents) {
  if (intents.includes("price")) {
    return "Bạn đang muốn hỏi giá của sản phẩm nào trong danh mục Minh Phát?";
  }

  if (intents.includes("inventory")) {
    return "Bạn muốn kiểm tra tình trạng tồn kho của sản phẩm nào?";
  }

  if (intents.includes("specifications")) {
    return "Bạn muốn tìm hiểu thông số kỹ thuật của máy nào?";
  }

  if (intents.includes("comparison")) {
    return "Bạn muốn so sánh những sản phẩm nào của Minh Phát?";
  }

  return "Bạn có thể mô tả cụ thể hơn nhu cầu của mình để mình hỗ trợ chính xác nhé.";
}

// ======================================================
// 5. TẠO CÂU HỎI ĐỀ XUẤT
// ======================================================

function getSuggestions(intents = []) {
  const suggestions = intents.flatMap(
    (intent) => SUGGESTIONS_BY_INTENT[intent] || []
  );

  return [...new Set(suggestions)].slice(0, 3);
}

// ======================================================
// 6. TẠO RESPONSE
// ======================================================

function createResponse(
  answer,
  needsBooking = false,
  intents = [],
  userMessage = ""
) {
  const shouldShowBooking =
    needsBooking ||
    hasExplicitBookingIntent(userMessage);

  return buildChatResponse({
    answer,
    suggestions: getSuggestions(intents),
    needsBooking: shouldShowBooking,
  });
}

// ======================================================
// 7. XỬ LÝ TIN NHẮN CHAT
// ======================================================

export async function postChat(req, res, next) {
  const message = req.body?.message;

  // --------------------------------------------------
  // 7.1. KIỂM TRA ĐẦU VÀO
  // --------------------------------------------------

  if (
    typeof message !== "string" ||
    !message.trim() ||
    message.trim().length > 2000
  ) {
    return res.status(400).json({
      error: "Tin nhắn không hợp lệ.",
    });
  }

  try {
    const userMessage = message.trim();

    // ==================================================
    // 7.2. ƯU TIÊN YÊU CẦU ĐẶT LỊCH TRỰC TIẾP
    // ==================================================

    // Nếu khách chủ động yêu cầu gặp nhân viên hoặc đặt lịch,
    // không cần gọi Gemini phân tích lại.
    // Tránh việc AI hiểu nhầm yêu cầu thành tìm kiếm sản phẩm.

    if (hasExplicitBookingIntent(userMessage)) {
      return res.json(
        createResponse(
          "Minh Phát rất sẵn lòng hỗ trợ bạn! Bạn hãy nhấn nút Đặt lịch tư vấn bên dưới để lựa chọn thời gian phù hợp và cung cấp thông tin liên hệ. Nhân viên của chúng mình sẽ hỗ trợ bạn trực tiếp nhé!",
          true,
          ["consultation"],
          userMessage
        )
      );
    }

    // ==================================================
    // 7.3. GEMINI PHÂN TÍCH CÂU HỎI
    // ==================================================

    const analysis = await analyzeCustomerIntent({
      question: userMessage,
      productCatalog: products,
      conversationHistory: [],
    });

    // --------------------------------------------------
    // 7.4. XỬ LÝ KHI GEMINI KHÔNG PHẢN HỒI
    // --------------------------------------------------

    if (!analysis) {
      return res.json(
        createResponse(AI_UNAVAILABLE_ANSWER)
      );
    }

    const scope = analysis.scope;

    const intents = Array.isArray(analysis.intents)
      ? analysis.intents
      : [];

    const productIds = Array.isArray(analysis.productIds)
      ? analysis.productIds
      : [];

    const productMention =
      typeof analysis.productMention === "string"
        ? analysis.productMention.trim()
        : "";

    const confidence = Number(analysis.confidence) || 0;

    // ==================================================
    // 8. KIỂM TRA PHẠM VI CÂU HỎI
    // ==================================================

    // Câu hỏi ngoài phạm vi không hiển thị nút đặt lịch
    // nếu khách không chủ động yêu cầu đặt lịch.

    if (scope === "out_of_scope") {
      return res.json(
        createResponse(
          OUT_OF_SCOPE_ANSWER,
          false,
          ["general"],
          userMessage
        )
      );
    }

    // ==================================================
    // 9. KIỂM TRA KẾT QUẢ PHÂN TÍCH
    // ==================================================

    if (
      scope !== "in_scope" ||
      intents.length === 0 ||
      intents.includes("unknown") ||
      confidence < MIN_CONFIDENCE
    ) {
      const clarification =
        analysis.clarificationQuestion ||
        "Mình chưa xác định rõ nhu cầu của bạn. Bạn có thể diễn đạt cụ thể hơn được không?";

      return res.json(
        createResponse(
          clarification,
          false,
          intents,
          userMessage
        )
      );
    }

    // ==================================================
    // 10. XỬ LÝ CÂU HỎI CẦN LÀM RÕ
    // ==================================================

    // Chỉ hỏi lại khi khách chưa cung cấp đủ thông tin.
    // Không hỏi lại tên sản phẩm nếu productMention đã có.

    if (
      analysis.needsClarification &&
      analysis.clarificationQuestion &&
      !productMention
    ) {
      return res.json(
        createResponse(
          analysis.clarificationQuestion,
          false,
          intents,
          userMessage
        )
      );
    }

    // ==================================================
    // 11. KIỂM TRA SẢN PHẨM CỤ THỂ
    // ==================================================

    const requiresSpecificProduct =
      PRODUCT_SPECIFIC_INTENTS.some((intent) =>
        intents.includes(intent)
      );

    // Nếu khách hỏi giá, tồn kho hoặc thông số
    // nhưng chưa nói rõ sản phẩm thì mới hỏi lại.

    if (
      requiresSpecificProduct &&
      productIds.length === 0 &&
      !productMention
    ) {
      return res.json(
        createResponse(
          getClarificationQuestion(intents),
          false,
          intents,
          userMessage
        )
      );
    }

    // ==================================================
    // 12. TRUY XUẤT DỮ LIỆU ĐÃ XÁC MINH
    // ==================================================

    const structuredKnowledge = getStructuredKnowledge(
      userMessage,
      analysis
    );

    // ==================================================
    // 13. KHÔNG CÓ DỮ LIỆU TRONG DATABASE
    // ==================================================

    // Câu hỏi vẫn thuộc phạm vi Minh Phát
    // nhưng không tìm thấy dữ liệu xác minh:
    // Thông báo rõ và mời khách đặt lịch tư vấn.

    if (!structuredKnowledge.hasKnowledge) {
      return res.json(
        createResponse(
          UNKNOWN_IN_SCOPE_ANSWER,
          true,
          intents,
          userMessage
        )
      );
    }

    // ==================================================
    // 14. GEMINI TẠO CÂU TRẢ LỜI
    // ==================================================

    const aiAnswer = await generateConsultantAnswer({
      question: userMessage,
      verifiedContext: structuredKnowledge.context,
    });

    // ==================================================
    // 15. CÂU TRẢ LỜI DỰ PHÒNG
    // ==================================================

    const finalAnswer =
      aiAnswer || structuredKnowledge.answer;

    // ==================================================
    // 16. TRẢ KẾT QUẢ
    // ==================================================

    return res.json(
      createResponse(
        finalAnswer,
        false,
        intents,
        userMessage
      )
    );

  } catch (error) {
    console.error("Chat request failed:", error);

    return next(error);
  }
}
