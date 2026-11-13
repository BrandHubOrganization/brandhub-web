import { createElement, Fragment, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Select } from "@/components/ui/select";

describe("Select (Radix UI) - Real Radix SSR Integration", () => {
  it("renders trigger with combobox role, form attributes, and handles empty value without throwing", () => {
    const dynamicOptions = [
      { value: "retail", label: "Bán lẻ" },
      { value: "tech", label: "Công nghệ" },
    ];

    const html = renderToString(
      createElement(
        Select,
        {
          id: "industry-select",
          name: "industry",
          value: "",
          disabled: true,
          "aria-label": "Ngành nghề",
          onChange: () => {},
        },
        createElement("option", { value: "" }, "Chọn ngành nghề"),
        createElement(
          Fragment,
          null,
          dynamicOptions.map((opt) =>
            createElement(
              "option",
              { key: opt.value, value: opt.value },
              opt.label,
            ),
          ),
        ),
      ),
    );

    expect(html).toContain('role="combobox"');
    expect(html).toContain('data-slot="select"');
    expect(html).toContain('id="industry-select"');
    expect(html).toContain('aria-label="Ngành nghề"');
    expect(html).toContain("disabled");
  });

  it("renders with controlled non-empty value and custom className/wrapperClassName", () => {
    const html = renderToString(
      createElement(
        Select,
        {
          value: "tech",
          className: "custom-trigger",
          wrapperClassName: "custom-wrapper",
          onChange: () => {},
        },
        createElement("option", { value: "" }, "Chọn ngành nghề"),
        createElement("option", { value: "tech" }, "Công nghệ"),
      ),
    );

    expect(html).toContain("custom-wrapper");
    expect(html).toContain("custom-trigger");
    expect(html).toContain("data-[state=open]:border-brand-orange");
  });
});

describe("Select (Radix UI) - Options Parsing & Synthetic onChange", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("@radix-ui/react-select");
  });

  it("parses empty option, dynamic options, Fragment, disabled, and fires synthetic onChange with { target: { value } }", async () => {
    vi.resetModules();

    let capturedOnValueChange: ((val: string) => void) | undefined;
    let capturedRootValue: string | undefined;
    const renderedItems: Array<{ value: string; disabled?: boolean }> = [];

    vi.doMock("@radix-ui/react-select", () => ({
      Root: ({
        children,
        value,
        onValueChange,
        disabled,
      }: {
        children: ReactNode;
        value?: string;
        onValueChange?: (val: string) => void;
        disabled?: boolean;
      }) => {
        capturedRootValue = value;
        capturedOnValueChange = onValueChange;
        return createElement(
          "div",
          { "data-root-disabled": String(Boolean(disabled)) },
          children,
        );
      },
      Trigger: ({ children, ...props }: Record<string, unknown>) =>
        createElement("button", props, children as ReactNode),
      Value: () => createElement("span", null, capturedRootValue),
      Icon: ({ children }: { children: ReactNode }) =>
        createElement("span", null, children),
      Portal: ({ children }: { children: ReactNode }) =>
        createElement("div", { "data-portal": "true" }, children),
      Content: ({ children }: { children: ReactNode }) =>
        createElement("div", { "data-content": "true" }, children),
      Viewport: ({ children }: { children: ReactNode }) =>
        createElement("div", { "data-viewport": "true" }, children),
      Item: ({
        children,
        value,
        disabled,
      }: {
        children: ReactNode;
        value: string;
        disabled?: boolean;
      }) => {
        renderedItems.push({ value, disabled });
        return createElement(
          "div",
          { "data-item-value": value, "data-item-disabled": String(Boolean(disabled)) },
          children,
        );
      },
      ItemText: ({ children }: { children: ReactNode }) =>
        createElement("span", null, children),
      ItemIndicator: ({ children }: { children: ReactNode }) =>
        createElement("span", null, children),
    }));

    const { Select: MockedSelect } = await import("@/components/ui/select");
    const onChange = vi.fn();
    const onValueChange = vi.fn();

    const dynamicOptions = [
      { value: "fnb", label: "F&B", disabled: false },
      { value: "legacy", label: "Legacy", disabled: true },
    ];

    const html = renderToString(
      createElement(
        MockedSelect,
        {
          name: "industry",
          value: "",
          onChange,
          onValueChange,
        },
        createElement("option", { value: "" }, "Chọn ngành nghề"),
        createElement(
          Fragment,
          null,
          dynamicOptions.map((opt) =>
            createElement(
              "option",
              { key: opt.value, value: opt.value, disabled: opt.disabled },
              opt.label,
            ),
          ),
        ),
      ),
    );

    // Empty value mapped to non-empty sentinel for Radix
    expect(capturedRootValue).toBe("__select_empty__");
    expect(renderedItems).toEqual([
      { value: "__select_empty__", disabled: undefined },
      { value: "fnb", disabled: false },
      { value: "legacy", disabled: true },
    ]);
    expect(html).toContain("Chọn ngành nghề");
    expect(html).toContain("F&amp;B");
    expect(html).toContain("Legacy");

    // Simulate selecting a non-empty option
    capturedOnValueChange?.("fnb");
    expect(onValueChange).toHaveBeenCalledWith("fnb");
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { value: "fnb", name: "industry" },
        currentTarget: { value: "fnb", name: "industry" },
      }),
    );

    // Simulate selecting the empty option back
    capturedOnValueChange?.("__select_empty__");
    expect(onValueChange).toHaveBeenCalledWith("");
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { value: "", name: "industry" },
        currentTarget: { value: "", name: "industry" },
      }),
    );
  });
});
