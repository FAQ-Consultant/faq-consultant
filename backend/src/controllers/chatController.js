
import { products } from "../data/product.js";
import { defaultSuggestions } from "../data/faqKnowledge.js";

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
// CẤU HÌNH
// ======================================================

const MIN_CONFIDENCE = 0.55;

const UNKNOWN_IN_SCOPE_ANSWER =
  "Hiện tại mình chưa tìm thấy thông tin đã được xác minh trong dữ liệu Minh Phát để trả lời chính xác câu hỏi này. Bạn có thể đặt lịch tư vấn với nhân viên để được hỗ trợ cụ thể hơn nhé.";

const OUT_OF_SCOPE_ANSWER =
  "Mình là trợ lý tư vấn của Minh Phát, hiện hỗ trợ tra cứu sản phẩm, thông số kỹ thuật, giá bán, tồn kho, chính sách và tư vấn mua hàng. Câu hỏi này hiện nằm ngoài phạm vi hỗ trợ của mình. Nếu bạn đang có nhu cầu về máy móc hoặc thiết bị công nghiệp, mình có thể kết nối bạn với nhân viên tư vấn nhé.";

const AI_UNAVAILABLE_ANSWER =
  "Hiện tại hệ thống phân tích câu hỏi đang gặp sự cố. Bạn vui lòng thử lại sau ít phút nhé.";

const PRODUCT_SPECIFIC_INTENTS = [
  "price",
  "inventory",
  "specifications",
];

// ======================================================
// HÀM HỖ TRỢ
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

function createResponse(answer, needsBooking = false) {
  return buildChatResponse({
    answer,
    suggestions: defaultSuggestions,
    needsBooking,
  });
}

// ======================================================
// XỬ LÝ TIN NHẮN CHAT
// ======================================================

export async function postChat(req, res, next) {
  const message = req.body?.message;

  // 1. Kiểm tra đầu vào.
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

    // 2. Gemini phân tích câu hỏi.
    const analysis = await analyzeCustomerIntent({
      question: userMessage,
      productCatalog: products,
      conversationHistory: [],
    });

    // 3. Xử lý khi Gemini không phản hồi.
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

    const confidence = Number(analysis.confidence) || 0;

    // ==================================================
    // 4. ƯU TIÊN KIỂM TRA PHẠM VI CÂU HỎI
    // ==================================================

    // Nếu câu hỏi không liên quan đến Minh Phát,
    // chuyển khách hàng sang hướng tư vấn.
    // Không cần kiểm tra confidence hay intents trước.
    if (scope === "out_of_scope") {
      return res.json(
        createResponse(
          OUT_OF_SCOPE_ANSWER,
          true
        )
      );
    }

    // ==================================================
    // 5. KIỂM TRA KẾT QUẢ PHÂN TÍCH
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
        createResponse(clarification)
      );
    }

    // ==================================================
    // 6. XỬ LÝ CÂU HỎI CẦN LÀM RÕ
    // ==================================================

    if (
      analysis.needsClarification &&
      analysis.clarificationQuestion
    ) {
      return res.json(
        createResponse(
          analysis.clarificationQuestion
        )
      );
    }

    // ==================================================
    // 7. KIỂM TRA SẢN PHẨM CỤ THỂ
    // ==================================================

    const requiresSpecificProduct =
      PRODUCT_SPECIFIC_INTENTS.some((intent) =>
        intents.includes(intent)
      );

    if (
      requiresSpecificProduct &&
      productIds.length === 0
    ) {
      return res.json(
        createResponse(
          getClarificationQuestion(intents)
        )
      );
    }

    // ==================================================
    // 8. TRUY XUẤT DỮ LIỆU ĐÃ XÁC MINH
    // ==================================================

    const structuredKnowledge = getStructuredKnowledge(
      userMessage,
      analysis
    );

    // ==================================================
    // 9. KHÔNG CÓ DỮ LIỆU PHÙ HỢP
    // ==================================================

    if (!structuredKnowledge.hasKnowledge) {
      return res.json(
        createResponse(
          UNKNOWN_IN_SCOPE_ANSWER,
          true
        )
      );
    }

    // ==================================================
    // 10. GEMINI TẠO CÂU TRẢ LỜI
    // ==================================================

    const aiAnswer = await generateConsultantAnswer({
      question: userMessage,
      verifiedContext: structuredKnowledge.context,
    });

    // ==================================================
    // 11. CÂU TRẢ LỜI DỰ PHÒNG
    // ==================================================

    const finalAnswer =
      aiAnswer || structuredKnowledge.answer;

    // ==================================================
    // 12. TRẢ KẾT QUẢ
    // ==================================================

    return res.json(
      createResponse(
        finalAnswer,
        intents.includes("purchasing")
      )
    );

  } catch (error) {
    console.error("Chat request failed:", error);

    return next(error);
  }
}
