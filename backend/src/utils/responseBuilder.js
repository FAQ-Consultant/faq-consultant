
import { defaultSuggestions } from "../data/faqKnowledge.js";

export function buildChatResponse({
  answer,
  suggestions,
  needsBooking = false,
}) {
  // Nếu có gợi ý riêng thì sử dụng gợi ý riêng.
  // Chỉ dùng mặc định khi không có gợi ý riêng.
  const sourceSuggestions =
    Array.isArray(suggestions) && suggestions.length > 0
      ? suggestions
      : defaultSuggestions;

  // Loại bỏ nội dung không hợp lệ và câu hỏi trùng lặp.
  const safeSuggestions = [
    ...new Set(
      sourceSuggestions
        .filter(
          (item) =>
            typeof item === "string" && item.trim().length > 0
        )
        .map((item) => item.trim())
    ),
  ].slice(0, 3);

  return {
    answer: String(answer || ""),
    suggestions: safeSuggestions,
    needsBooking: Boolean(needsBooking),
  };
}
