import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { EditQuestion } from "./edit-plan";
import { questionCardMessages } from "./studio-messages";

export function QuestionCards({
  questions,
  disabled,
  locale,
  onComplete,
}: {
  questions: (string | EditQuestion)[];
  disabled: boolean;
  locale: "vi" | "en";
  onComplete: (answer: string) => void;
}) {
  const t = questionCardMessages[locale];
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState<(number | "custom" | null)[]>(() =>
    questions.map(() => null),
  );
  const [custom, setCustom] = useState<string[]>(() => questions.map(() => ""));
  const normalized = questions.map((q) =>
    typeof q === "string" ? { question: q, options: [] } : q,
  );
  const question = normalized[step];
  const options = question.options ?? [];
  const answerAt = (index: number) => {
    const choice = choices[index];
    return typeof choice === "number"
      ? (normalized[index].options?.[choice]?.label ?? "")
      : custom[index].trim();
  };
  useEffect(() => {
    heading.current?.focus();
  }, [step]);
  const select = (choice: number | "custom") =>
    setChoices((previous) =>
      previous.map((value, index) => (index === step ? choice : value)),
    );
  const last = step === questions.length - 1;
  return (
    <form
      className="bh-question-card"
      onSubmit={(event) => {
        event.preventDefault();
        if (disabled || !answerAt(step)) return;
        if (!last) {
          setStep(step + 1);
          return;
        }
        if (normalized.some((_, index) => !answerAt(index))) return;
        onComplete(
          JSON.stringify(
            normalized.map((q, index) => ({
              question: q.question,
              answer: answerAt(index),
            })),
          ),
        );
      }}
    >
      <div className="bh-question-progress" aria-live="polite">
        {t.question} {step + 1} {t.of} {questions.length}
      </div>
      <h4 id={`${id}-heading`} ref={heading} tabIndex={-1}>
        {question.question}
      </h4>
      <fieldset disabled={disabled} aria-labelledby={`${id}-heading`}>
        {options.map((option, index) => (
          <label
            key={option.label}
            className="bh-question-option"
            data-selected={choices[step] === index}
          >
            <input
              type="radio"
              name={id}
              checked={choices[step] === index}
              onChange={() => select(index)}
            />
            <span>
              <strong>{option.label}</strong>
              {option.recommended && <small>{t.recommended}</small>}
              {option.description && (
                <span className="bh-question-description">
                  {option.description}
                </span>
              )}
            </span>
          </label>
        ))}
        {options.length > 0 && (
          <label
            className="bh-question-option"
            data-selected={choices[step] === "custom"}
          >
            <input
              type="radio"
              name={id}
              checked={choices[step] === "custom"}
              onChange={() => select("custom")}
            />
            <span>
              <strong>{t.other}</strong>
              <span className="bh-question-description">
                {t.otherDescription}
              </span>
            </span>
          </label>
        )}
        {(options.length === 0 || choices[step] === "custom") && (
          <div className="bh-question-custom">
            <label htmlFor={`${id}-answer`}>{t.answer}</label>
            <Textarea
              id={`${id}-answer`}
              rows={3}
              maxLength={1000}
              value={custom[step]}
              placeholder={t.placeholder}
              onChange={(event) =>
                setCustom((previous) =>
                  previous.map((value, index) =>
                    index === step ? event.target.value : value,
                  ),
                )
              }
            />
          </div>
        )}
      </fieldset>
      <div className="bh-question-navigation">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || step === 0}
          onClick={() => setStep(step - 1)}
        >
          {t.back}
        </Button>
        <Button type="submit" disabled={disabled || !answerAt(step)}>
          {last ? t.submit : t.next}
        </Button>
      </div>
    </form>
  );
}
