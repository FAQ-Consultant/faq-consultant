/**
 * Tests for src/utils/matchFaq.js
 * Run with: node --test src/__tests__/matchFaq.test.js
 */

import { strict as assert } from "assert";
import { describe, it } from "node:test";
import {
  isConsultationQuestion,
  matchFaq,
  normalizeText,
} from "../utils/matchFaq.js";

// ---------------------------------------------------------------------------
// normalizeText
// ---------------------------------------------------------------------------
describe("normalizeText", () => {
  it("strips Vietnamese diacritics", () => {
    assert.equal(normalizeText("Công ty"), "cong ty");
  });

  it("replaces đ/Đ with d/D", () => {
    assert.equal(normalizeText("đặt lịch"), "dat lich");
  });

  it("removes punctuation and extra spaces", () => {
    assert.equal(normalizeText("  hello,  world!  "), "hello world");
  });

  it("returns empty string for empty input", () => {
    assert.equal(normalizeText(""), "");
    assert.equal(normalizeText(), "");
  });

  it("lowercases everything", () => {
    assert.equal(normalizeText("MAY PHAY CNC"), "may phay cnc");
  });
});

// ---------------------------------------------------------------------------
// matchFaq — exact and near-exact matches
// ---------------------------------------------------------------------------
describe("matchFaq — exact matches", () => {
  it("matches product-categories with exact pattern", () => {
    const result = matchFaq("Công ty kinh doanh những loại máy nào?");
    assert.ok(result, "Expected a match");
    assert.equal(result.id, "product-categories");
  });

  it("matches machine-pricing with exact pattern", () => {
    const result = matchFaq("Giá máy khoan bàn là bao nhiêu?");
    assert.ok(result, "Expected a match");
    assert.equal(result.id, "machine-pricing");
  });

  it("matches consultation-booking with exact pattern", () => {
    const result = matchFaq("Tôi có thể đặt lịch tư vấn không?");
    assert.ok(result, "Expected a match");
    assert.equal(result.id, "consultation-booking");
  });
});

// ---------------------------------------------------------------------------
// matchFaq — partial / synonym matches
// ---------------------------------------------------------------------------
describe("matchFaq — partial and synonym matches", () => {
  it("matches warranty-policy with partial phrase 'bảo hành máy móc'", () => {
    const result = matchFaq("bảo hành máy móc");
    assert.ok(result, "Expected a match");
    assert.equal(result.id, "warranty-policy");
  });

  it("matches delivery-policy with 'phí vận chuyển'", () => {
    const result = matchFaq("phí vận chuyển bao nhiêu");
    assert.ok(result, "Expected a match");
    assert.equal(result.id, "delivery-policy");
  });

  it("matches technical-specifications with 'thông số kỹ thuật'", () => {
    const result = matchFaq("thông số kỹ thuật của máy");
    assert.ok(result, "Expected a match");
    assert.equal(result.id, "technical-specifications");
  });

  it("matches machine-availability with 'còn hàng không'", () => {
    const result = matchFaq("máy phay cnc còn hàng không");
    assert.ok(result, "Expected a match");
    assert.equal(result.id, "machine-availability");
  });

  it("matches bulk-purchase with 'mua số lượng lớn'", () => {
    const result = matchFaq("mua số lượng lớn thì được chiết khấu không");
    assert.ok(result, "Expected a match");
    assert.equal(result.id, "bulk-purchase");
  });

  it("matches consultation-preparation with 'cần chuẩn bị gì'", () => {
    const result = matchFaq("cần chuẩn bị gì trước khi tư vấn");
    assert.ok(result, "Expected a match");
    assert.equal(result.id, "consultation-preparation");
  });
});

// ---------------------------------------------------------------------------
// matchFaq — out-of-scope returns null
// ---------------------------------------------------------------------------
describe("matchFaq — out-of-scope queries", () => {
  it("returns null for completely unrelated query", () => {
    const result = matchFaq("thời tiết hôm nay thế nào?");
    assert.equal(result, null);
  });

  it("returns null for empty string", () => {
    const result = matchFaq("");
    assert.equal(result, null);
  });

  it("returns null for gibberish", () => {
    const result = matchFaq("asdfghjkl zxcvb qwerty 12345");
    assert.equal(result, null);
  });
});

// ---------------------------------------------------------------------------
// isConsultationQuestion
// ---------------------------------------------------------------------------
describe("isConsultationQuestion", () => {
  it("detects 'đặt lịch' as consultation intent", () => {
    assert.equal(isConsultationQuestion("tôi muốn đặt lịch"), true);
  });

  it("detects 'tư vấn' as consultation intent", () => {
    assert.equal(isConsultationQuestion("cần được tư vấn thêm"), true);
  });

  it("detects 'giá' as consultation intent", () => {
    assert.equal(isConsultationQuestion("giá máy bao nhiêu"), true);
  });

  it("returns false for unrelated topic", () => {
    assert.equal(isConsultationQuestion("con mèo của tôi"), false);
  });
});
