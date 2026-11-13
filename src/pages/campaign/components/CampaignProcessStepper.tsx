import { Fragment, useId } from "react";
import { useTranslation } from "react-i18next";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  Handshake,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type CampaignProcessStep = "info" | "tasks" | "partners";

interface Props {
  activeStep: CampaignProcessStep;
  onSelectStep: (step: CampaignProcessStep) => void;
  infoDone: boolean;
  infoSummary: string;
  tasksDone: boolean;
  tasksSummary: string;
  partnersDone: boolean;
  partnersSummary: string;
}

export function CampaignProcessStepper({
  activeStep,
  onSelectStep,
  infoDone,
  infoSummary,
  tasksDone,
  tasksSummary,
  partnersDone,
  partnersSummary,
}: Props) {
  const { t } = useTranslation();
  const groupId = useId();
  const reduceMotion = useReducedMotion();

  const steps: {
    id: CampaignProcessStep;
    number: number;
    title: string;
    summary: string;
    done: boolean;
    icon: typeof FileText;
  }[] = [
    {
      id: "info",
      number: 1,
      title: t("campaign.process.step1Title"),
      summary: infoSummary,
      done: infoDone,
      icon: FileText,
    },
    {
      id: "tasks",
      number: 2,
      title: t("campaign.process.step2Title"),
      summary: tasksSummary,
      done: tasksDone,
      icon: ListChecks,
    },
    {
      id: "partners",
      number: 3,
      title: t("campaign.process.step3Title"),
      summary: partnersSummary,
      done: partnersDone,
      icon: Handshake,
    },
  ];

  return (
    <LayoutGroup id={groupId}>
      <nav
        aria-label={t("campaign.process.ariaLabel")}
        className="border-border bg-card shrink-0 rounded-xl border p-1.5 shadow-2xs"
      >
        <div className="flex flex-col items-stretch gap-1 md:flex-row md:items-center md:gap-1.5">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const active = activeStep === step.id;
            return (
              <Fragment key={step.id}>
                {index > 0 && (
                  <ChevronRight
                    aria-hidden
                    className="text-muted-foreground/45 hidden size-4 shrink-0 md:block"
                  />
                )}
                <button
                  type="button"
                  onClick={() => onSelectStep(step.id)}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "focus-visible:ring-ring/50 relative flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors outline-none focus-visible:ring-2",
                    active
                      ? "text-foreground"
                      : step.done
                        ? "hover:bg-muted/50"
                        : "hover:bg-muted/45",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId={`stepper-active-${groupId}`}
                      aria-hidden="true"
                      transition={
                        reduceMotion
                          ? { duration: 0.08 }
                          : { type: "spring", stiffness: 460, damping: 32 }
                      }
                      className="border-brand-orange/60 bg-brand-orange-soft/60 absolute inset-0 rounded-lg border shadow-2xs"
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 flex size-6.5 shrink-0 items-center justify-center rounded-md text-xs font-bold transition-colors",
                      active
                        ? "bg-brand-orange text-white shadow-2xs"
                        : step.done
                          ? "bg-brand-orange/15 text-brand-orange"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {step.done && !active ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : (
                      step.number
                    )}
                  </span>
                  <div className="relative z-10 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Icon
                        className={cn(
                          "size-3.5 shrink-0",
                          active || step.done
                            ? "text-brand-orange"
                            : "text-muted-foreground",
                        )}
                      />
                      <span
                        className={cn(
                          "truncate text-xs font-semibold",
                          active ? "text-brand-orange" : "text-foreground",
                        )}
                      >
                        {step.title}
                      </span>
                    </div>
                    <p className="text-muted-foreground truncate text-[11px]">
                      {step.summary}
                    </p>
                  </div>
                </button>
              </Fragment>
            );
          })}
        </div>
      </nav>
    </LayoutGroup>
  );
}
