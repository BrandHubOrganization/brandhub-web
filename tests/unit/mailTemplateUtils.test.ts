import { describe, expect, it } from "vitest";
import { parseRecipients } from "../../src/pages/mail-templates/utils";

describe("parseRecipients without a header row", () => {
  it("reads a single line as email and name", () => {
    expect(parseRecipients("a@example.com,Trung")).toEqual({
      recipients: [{ email: "a@example.com", name: "Trung" }],
      invalid: [],
    });
  });

  it("reads one email,name pair per line", () => {
    const r = parseRecipients("a@example.com, Trung Le\nb@example.com;An");
    expect(r.recipients).toEqual([
      { email: "a@example.com", name: "Trung Le" },
      { email: "b@example.com", name: "An" },
    ]);
    expect(r.invalid).toEqual([]);
  });

  it("still accepts several emails separated by commas, semicolons or spaces", () => {
    expect(parseRecipients("a@example.com, b@example.com; c@example.com").recipients.map((x) => x.email)).toEqual([
      "a@example.com",
      "b@example.com",
      "c@example.com",
    ]);
    expect(parseRecipients("a@example.com b@example.com\nc@example.com").recipients).toHaveLength(3);
  });

  it("reports text that is neither an email nor a name", () => {
    expect(parseRecipients("not-an-email").invalid).toEqual(["not-an-email"]);
    expect(parseRecipients("a@example.com, Trung, extra").invalid).toEqual(["extra"]);
  });

  it("keeps the CSV with an email header working", () => {
    const r = parseRecipients("email,name,company\na@example.com,Trung,Acme");
    expect(r.recipients).toEqual([{ email: "a@example.com", name: "Trung", variables: { company: "Acme" } }]);
  });
});
