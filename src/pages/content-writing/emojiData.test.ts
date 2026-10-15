import text from "../../../public/data/emoji-test-17.0.txt?raw";
import { describe, expect, it, vi, afterEach } from "vitest";
import { loadEmojiData, parseEmojiData } from "./emojiData";

afterEach(() => vi.unstubAllGlobals());
describe("local Unicode emoji data", () => {
  it("retains nine categories and more than 1800 base sequences", () => {
    const entries = parseEmojiData(text);
    expect(new Set(entries.map(entry => entry.group)).size).toBe(9);
    expect(entries.length).toBeGreaterThan(1800);
    expect(entries.find(entry => entry.emoji === "😀")?.annotation).toBe("grinning face");
    expect(entries.some(entry => entry.emoji === "🇻🇳")).toBe(true);
    expect(entries.some(entry => entry.emoji === "👩‍💻")).toBe(true);
    expect(entries.some(entry => /[\u{1F3FB}-\u{1F3FF}]/u.test(entry.emoji))).toBe(false);
    expect(new Set(entries.map(entry => entry.emoji)).size).toBe(entries.length);
  });
  it("rejects an HTML fallback instead of displaying an empty success", () => {
    expect(() => parseEmojiData("<html>missing asset</html>")).toThrow("INVALID_EMOJI_DATA");
  });
  it("loads from this app and can retry a failed load", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, text: async () => text });
    vi.stubGlobal("fetch", fetcher);
    await expect(loadEmojiData()).rejects.toThrow();
    expect((await loadEmojiData()).length).toBeGreaterThan(1800);
    expect(fetcher).toHaveBeenLastCalledWith("/data/emoji-test-17.0.txt");
  });
});
