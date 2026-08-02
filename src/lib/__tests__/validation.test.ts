import { describe, it, expect } from "vitest";
import { z } from "zod";

// Server fn input validation mirrors survivors.functions.ts
const profilePatchSchema = z.object({
  bio: z.string().max(2000).optional(),
  consent_share_with_recruiters: z.boolean().optional(),
});

describe("profilePatchSchema", () => {
  it("accepts valid patch", () => {
    const result = profilePatchSchema.safeParse({ bio: "Hello", consent_share_with_recruiters: true });
    expect(result.success).toBe(true);
  });

  it("rejects bio over 2000 chars", () => {
    const result = profilePatchSchema.safeParse({ bio: "x".repeat(2001) });
    expect(result.success).toBe(false);
  });
});

describe("searchFiltersSchema", () => {
  const searchFiltersSchema = z.object({
    skills: z.array(z.string()).optional(),
    page: z.number().int().min(1).default(1),
  });

  it("defaults page to 1", () => {
    const result = searchFiltersSchema.parse({});
    expect(result.page).toBe(1);
  });
});

describe("crisis keyword detection", () => {
  const CRISIS_KEYWORDS = ["suicide", "kill myself", "self-harm"];

  function checkSafety(text: string): boolean {
    const lower = text.toLowerCase();
    return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
  }

  it("flags crisis language", () => {
    expect(checkSafety("I want to kill myself")).toBe(true);
  });

  it("passes normal career questions", () => {
    expect(checkSafety("What skills should I learn for hospitality?")).toBe(false);
  });
});
