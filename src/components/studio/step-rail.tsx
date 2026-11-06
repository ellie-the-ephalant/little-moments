import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { StudioStep } from "@/lib/types";

interface StepRailProps {
  currentStep: StudioStep;
  isFinishAvailable: boolean;
  onStepChange: (step: StudioStep) => void;
}

const steps: { id: StudioStep; number: string; label: string }[] = [
  { id: "setup", number: "01", label: "Setup" },
  { id: "booth", number: "02", label: "Booth" },
  { id: "finish", number: "03", label: "Finish" },
];

export const StepRail = ({
  currentStep,
  isFinishAvailable,
  onStepChange,
}: StepRailProps) => {
  const currentIndex = steps.findIndex(({ id }) => id === currentStep);

  return (
    <nav aria-label="Studio steps" className="site-container py-4 sm:py-5">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCurrent = step.id === currentStep;
          const isComplete = index < currentIndex;
          const isDisabled = step.id === "finish" && !isFinishAvailable;

          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-center">
              <button
                type="button"
                aria-current={isCurrent ? "step" : undefined}
                disabled={isDisabled}
                onClick={() => onStepChange(step.id)}
                className={cn(
                  "inline-flex min-h-11 min-w-0 items-center gap-2 rounded-control px-1.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-45 sm:gap-3 sm:px-2",
                  isCurrent
                    ? "font-bold text-brick"
                    : isComplete
                      ? "font-semibold text-ink"
                      : "font-semibold text-ink-soft hover:text-ink",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border text-[0.625rem] font-bold tracking-[0.08em]",
                    isCurrent
                      ? "border-brick bg-brick text-cream"
                      : isComplete
                        ? "border-ink bg-ink text-cream"
                        : "border-rule bg-paper text-ink-soft",
                  )}
                >
                  {isComplete ? <Check className="size-3.5" /> : step.number}
                </span>
                <span className="truncate">{step.label}</span>
              </button>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="perforation mx-1 min-w-2 flex-1 sm:mx-3"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
