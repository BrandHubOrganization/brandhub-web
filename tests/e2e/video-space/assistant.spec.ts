import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";
import {
  VideoSpaceApiFixture,
  WORKSPACE,
  USER,
  JOB,
  ARTIFACT_ROOT,
} from "./fixture";
import {
  assistantMessages,
  questionCardMessages,
} from "../../../vendor/video-space/src/brandhub/studio-messages";

interface Scene {
  tracks: {
    main: { elements: { id: string; params: Record<string, unknown> }[] };
    overlay: { elements: { id: string; params: Record<string, unknown> }[] }[];
  };
}

for (const variant of [
  { clarify: false, structured: false, locale: "en", theme: "dark" },
  { clarify: true, structured: false, locale: "en", theme: "dark" },
  { clarify: true, structured: true, locale: "en", theme: "dark" },
  { clarify: true, structured: true, locale: "vi", theme: "light" },
] as const) {
  const { clarify, structured, locale, theme } = variant;
  const t = assistantMessages[locale];
  const q = questionCardMessages[locale];
  test(`AI edits native layers with one undo (clarification=${clarify},structured=${structured},${locale}/${theme})`, async ({
    page,
    context,
  }) => {
    const api = new VideoSpaceApiFixture();
    await page.setViewportSize({ width: 1366, height: 768 });
    await api.install(context, USER, locale, theme);
    let calls = 0;
    await context.route("**/video-projects/*/edit-plans", async (route) => {
      calls++;
      const request = route.request();
      expect(request.headers()["authorization"]).toBe(
        "Bearer fixture-access-token",
      );
      expect(request.headers()["idempotency-key"]).toBeTruthy();
      const project = [...api.projects.values()][0];
      expect(request.postDataJSON().expected_revision).toBe(project.revision);
      if (clarify && calls === 1) {
        await route.fulfill({
          status: 200,
          json: {
            success: true,
            data: {
              summary: "Please provide the title.",
              base_revision: project.revision,
              actions: [],
              questions: structured
                ? [
                    {
                      question: "Which layout?",
                      options: [
                        {
                          label: "Portrait",
                          description: "Best for phones",
                          recommended: true,
                        },
                        {
                          label: "Landscape",
                          description: "Best for wide screens",
                        },
                      ],
                    },
                    {
                      question: "What exact title should appear?",
                      options: [],
                    },
                  ]
                : ["What exact title should appear?"],
            },
          },
        });
        return;
      }
      if (clarify) {
        if (structured) {
          expect(request.postDataJSON().instruction).toContain("Which layout?");
          expect(request.postDataJSON().instruction).toContain("Square");
        }
        expect(request.postDataJSON().instruction).toContain(
          "Add a launch title and reduce volume by half",
        );
        expect(request.postDataJSON().instruction).toContain(
          "What exact title should appear?",
        );
        expect(request.postDataJSON().instruction).toContain(
          "Discover something new",
        );
      }
      if (
        request.postDataJSON().instruction.endsWith("Keep it exactly like this")
      ) {
        expect(request.postDataJSON().instruction).toContain(
          "Current user request:",
        );
        expect(request.postDataJSON().instruction).toContain(
          "Add a launch title and reduce volume by half",
        );
        await route.fulfill({
          status: 200,
          json: {
            success: true,
            data: {
              summary: "Kept current edit.",
              actions: [],
              base_revision: project.revision,
            },
          },
        });
        return;
      }
      const clip = (project.snapshot.scenes as Scene[])[0].tracks.main
        .elements[0];
      await route.fulfill({
        status: 200,
        json: {
          success: true,
          data: {
            summary: "Add a launch title and reduce clip volume.",
            base_revision: project.revision,
            actions: [
              {
                kind: "add_text",
                text: "Discover something new",
                start_seconds: 0,
                duration_seconds: 1,
                style: {
                  font_family: "Oswald",
                  color: "#F5F1E6",
                  background_color: "#1E5631",
                  bold: true,
                  position: "bottom",
                  animation: "pop",
                },
              },
              { kind: "set_volume", element_id: clip.id, volume: 0.5 },
            ],
          },
        },
      });
    });
    await page.goto(`/workspaces/${WORKSPACE}/video-space?jobId=${JOB}`);
    const editor = page.frameLocator('iframe[src="/video-space/index.html"]');
    await expect(
      editor.getByRole("button", { name: t.save, exact: true }),
    ).toBeVisible({ timeout: 90_000 });
    await expect.poll(() => api.projects.size).toBe(1);
    const project = [...api.projects.values()][0];
    const before = structuredClone(project.snapshot);
    await editor
      .getByRole("button", { name: t.assistant, exact: true })
      .click();
    await editor
      .getByRole("textbox", { name: t.instruction, exact: true })
      .fill("Add a launch title and reduce volume by half");
    await editor.getByRole("button", { name: t.propose, exact: true }).click();
    if (clarify) {
      if (structured) {
        await expect(
          editor.getByRole("heading", { name: "Which layout?", exact: true }),
        ).toBeVisible();
        const next = editor.getByRole("button", { name: q.next, exact: true });
        await expect(next).toBeDisabled();
        const portrait = editor.getByRole("radio", { name: /Portrait/ });
        await expect(portrait).not.toBeChecked();
        await portrait.focus();
        await portrait.press("Space");
        await next.click();
        expect(calls).toBe(1);
        await editor
          .getByRole("textbox", { name: q.answer, exact: true })
          .fill("Discover something new");
        await editor.getByRole("button", { name: q.back, exact: true }).click();
        await expect(portrait).toBeChecked();
        mkdirSync(ARTIFACT_ROOT, { recursive: true });
        await page.screenshot({
          path: path.join(ARTIFACT_ROOT, `question-card-${locale}.png`),
        });
        await editor.getByRole("radio", { name: new RegExp(q.other) }).check();
        await editor
          .getByRole("textbox", { name: q.answer, exact: true })
          .fill("Square");
        await next.click();
        await expect(
          editor.getByRole("textbox", { name: q.answer, exact: true }),
        ).toHaveValue("Discover something new");
        expect(calls).toBe(1);
      }
      await expect(
        editor.getByText("What exact title should appear?", { exact: true }),
      ).toBeVisible();
      expect((project.snapshot.scenes as Scene[])[0].tracks).toEqual(
        (before.scenes as Scene[])[0].tracks,
      );
      await editor
        .getByRole("textbox", { name: t.answer, exact: true })
        .fill("Discover something new");
      await editor.getByRole("button", { name: t.reply, exact: true }).click();
    }
    await expect(
      editor.getByText("Add a launch title and reduce clip volume.", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      editor.getByText(t.applied, {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      editor.locator('.bh-ai-message[data-role="user"]').first(),
    ).toContainText("Add a launch title and reduce volume by half");
    if (structured && locale === "en") {
      await editor
        .getByRole("textbox", { name: t.instruction, exact: true })
        .fill("Keep it exactly like this");
      await editor
        .getByRole("button", { name: t.propose, exact: true })
        .click();
      await expect(
        editor.getByText("Kept current edit.", { exact: true }),
      ).toBeVisible();
    }
    await editor.getByRole("button", { name: t.close, exact: true }).click();
    await editor
      .getByRole("button", { name: t.assistant, exact: true })
      .click();
    await expect(
      editor.locator('.bh-ai-message[data-role="user"]').first(),
    ).toContainText("Add a launch title and reduce volume by half");
    await expect(
      editor.getByText("Add a launch title and reduce clip volume.", {
        exact: true,
      }),
    ).toBeVisible();
    mkdirSync(ARTIFACT_ROOT, { recursive: true });
    await expect
      .poll(() =>
        editor
          .locator(".bh-ai-panel")
          .evaluate((element) =>
            Math.abs(element.getBoundingClientRect().right - window.innerWidth),
          ),
      )
      .toBeLessThan(1);
    await page.screenshot({
      path: path.join(
        ARTIFACT_ROOT,
        `chat-transcript-${locale}-${structured}.png`,
      ),
    });
    await editor
      .getByRole("button", { name: t.newRequest, exact: true })
      .click();
    await expect(
      editor.locator('.bh-ai-message[data-role="user"]'),
    ).toHaveCount(0);
    await editor.getByRole("button", { name: t.close, exact: true }).click();
    const save = async () => {
      const revision = project.revision;
      await editor.getByRole("button", { name: t.save, exact: true }).click();
      await expect.poll(() => project.revision).toBe(revision + 1);
    };
    await expect
      .poll(
        () =>
          (project.snapshot.scenes as Scene[])[0].tracks.main.elements[0].params
            .volume,
      )
      .toBeCloseTo(-6.0206);
    let tracks = (project.snapshot.scenes as Scene[])[0].tracks;
    expect(tracks.main.elements[0].params.volume).toBeCloseTo(-6.0206);
    const title = tracks.overlay
      .flatMap((track) => track.elements)
      .find((clip) => clip.params.content === "Discover something new");
    expect(title?.params).toMatchObject({
      fontFamily: "Oswald",
      color: "#F5F1E6",
      fontWeight: "bold",
      "background.enabled": true,
      "background.color": "#1E5631",
    });
    expect(Number(title?.params["transform.positionY"])).toBeGreaterThan(0);
    expect(
      (title as { animations?: Record<string, unknown> } | undefined)
        ?.animations?.["transform.scaleX"],
    ).toBeTruthy();
    mkdirSync(ARTIFACT_ROOT, { recursive: true });
    await page.screenshot({
      path: path.join(
        ARTIFACT_ROOT,
        `assistant-applied-${locale}-${clarify}.png`,
      ),
    });
    await editor
      .locator(`[data-element-id="${tracks.main.elements[0].id}"]`)
      .click();
    await page.keyboard.press("Control+z");
    await save();
    tracks = (project.snapshot.scenes as Scene[])[0].tracks;
    expect(tracks).toEqual((before.scenes as Scene[])[0].tracks);
    expect(calls).toBe(clarify ? (structured && locale === "en" ? 3 : 2) : 1);
  });
}
