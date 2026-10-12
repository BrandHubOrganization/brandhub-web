import { describe, expect, it } from "vitest";
import {
  extractVariables,
  htmlToPlainText,
  isEmail,
  parseCsv,
  parseRecipients,
  userVariables,
} from "./utils";

describe("extractVariables", () => {
  it("finds distinct variables in order and tolerates spaces", () => {
    expect(extractVariables("Hi {{name}}", "<p>{{ company }} {{name}}</p>")).toEqual(["name", "company"]);
  });
  it("ignores names with spaces or symbols", () => {
    expect(extractVariables("{{two words}} {{a-b}}")).toEqual([]);
  });
  it("userVariables drops the built-ins", () => {
    expect(userVariables("{{workspaceName}} {{name}} {{senderName}}")).toEqual(["name"]);
  });
});

describe("parseCsv", () => {
  it("handles BOM, quotes, escaped quotes and CRLF", () => {
    const rows = parseCsv('\uFEFFemail,name\r\na@x.test,"Doe, ""J"""\r\n');
    expect(rows).toEqual([["email", "name"], ["a@x.test", 'Doe, "J"']]);
  });
  it("detects semicolons and tabs", () => {
    expect(parseCsv("email;name\na@x.test;An")[1]).toEqual(["a@x.test", "An"]);
    expect(parseCsv("email\tname\na@x.test\tAn")[1]).toEqual(["a@x.test", "An"]);
  });
  it("skips blank lines", () => {
    expect(parseCsv("a\n\n\nb\n")).toEqual([["a"], ["b"]]);
  });
});

describe("parseRecipients", () => {
  it("maps header columns to name and variables", () => {
    const { recipients, invalid } = parseRecipients("email,name,company\na@x.test,An,ACME\nbad,Bo,X");
    expect(recipients).toEqual([{ email: "a@x.test", name: "An", variables: { company: "ACME" } }]);
    expect(invalid).toEqual(["bad"]);
  });
  it("accepts a plain list separated by lines, commas, semicolons and spaces", () => {
    const { recipients } = parseRecipients("a@x.test, b@x.test;c@x.test\nd@x.test e@x.test");
    expect(recipients.map((r) => r.email)).toEqual(["a@x.test", "b@x.test", "c@x.test", "d@x.test", "e@x.test"]);
  });
  it("reports invalid plain tokens", () => {
    expect(parseRecipients("a@x.test nope").invalid).toEqual(["nope"]);
  });
  it("returns nothing for empty input", () => {
    expect(parseRecipients("  \n ")).toEqual({ recipients: [], invalid: [] });
  });
});

describe("isEmail", () => {
  it("validates basic shapes", () => {
    expect(isEmail("a@b.co")).toBe(true);
    for (const bad of ["a", "a@b", "a b@c.d", "<a@b.c>"]) expect(isEmail(bad)).toBe(false);
  });
});

describe("htmlToPlainText", () => {
  it("keeps paragraph breaks and decodes entities", () => {
    expect(htmlToPlainText("<p>Hello &amp; welcome</p><p>Line<br>two</p><ul><li>a</li></ul>"))
      .toBe("Hello & welcome\nLine\ntwo\n- a");
  });
});
