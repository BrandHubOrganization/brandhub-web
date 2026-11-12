import type { EditPlan } from "./edit-plan";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  plan?: EditPlan;
  applied?: boolean;
  failed?: boolean;
}

// Keep full current intent. Older turns are reference only, never commands to replay.
export function chatInstruction(
  messages: ChatMessage[],
  current: string,
): string {
  const prefix =
    "Conversation context (reference only; do not repeat earlier actions):\n";
  const suffix = `\nCurrent user request:\n${current}`;
  const selected: { role: string; text: string }[] = [];
  for (const message of messages.slice(-12).reverse()) {
    const candidate = [{ role: message.role, text: message.text }, ...selected];
    if ((prefix + JSON.stringify(candidate) + suffix).length > 4000) break;
    selected.unshift(candidate[0]);
  }
  return selected.length ? prefix + JSON.stringify(selected) + suffix : current;
}

export function displayAnswer(value: string): string {
  try {
    const pairs: unknown = JSON.parse(value);
    if (
      Array.isArray(pairs) &&
      pairs.length > 0 &&
      pairs.length <= 3 &&
      pairs.every(
        (pair) =>
          pair &&
          typeof pair.question === "string" &&
          typeof pair.answer === "string",
      )
    ) {
      return pairs
        .map((pair) => `${pair.question}\n${pair.answer}`)
        .join("\n\n");
    }
  } catch {
    /* A normal user message is already displayable. */
  }
  return value;
}
