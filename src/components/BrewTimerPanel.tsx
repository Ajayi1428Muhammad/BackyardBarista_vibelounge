import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  X,
} from 'lucide-react';
import { BrewStep, CoffeeRecipe } from '../types/coffee';

interface BrewTimerPanelProps {
  recipe: CoffeeRecipe;
  activeStepIndex: number;
  completedSteps: number[];
  onStepIndexChange: (index: number) => void;
  onMarkStepComplete: (stepNumber: number) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function inferPhaseLabel(step: BrewStep, index: number, total: number): string {
  const text = `${step.title} ${step.instruction}`.toLowerCase();
  if (text.includes('bloom')) return 'Blooming';
  if (text.includes('rinse') || text.includes('preheat') || text.includes('grind') || text.includes('prep')) {
    return 'Prep & Preheat';
  }
  if (
    text.includes('milk') ||
    text.includes('steam') ||
    text.includes('foam') ||
    text.includes('serve') ||
    text.includes('finish') ||
    index === total - 1
  ) {
    return 'Finish & Serve';
  }
  if (text.includes('steep') || text.includes('plunge') || text.includes('press')) {
    return 'Steep & Extraction';
  }
  return 'Main Extraction';
}

export function BrewTimerPanel({
  recipe,
  activeStepIndex,
  completedSteps,
  onStepIndexChange,
  onMarkStepComplete,
  onResetProgress,
  onClose,
}: BrewTimerPanelProps) {
  const steps = recipe.steps;
  const currentStep = steps[activeStepIndex] ?? steps[0];

  const [secondsLeft, setSecondsLeft] = useState<number>(
    currentStep?.durationSeconds ?? 30
  );
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Sync secondsLeft whenever the recipe or selected step changes
  useEffect(() => {
    setSecondsLeft(steps[activeStepIndex]?.durationSeconds ?? 30);
    setIsFinished(false);
  }, [recipe.id, activeStepIndex, steps]);

  useEffect(() => {
    setIsRunning(true);
  }, [recipe.id]);

  // Real-time 1s countdown loop
  useEffect(() => {
    if (!isRunning || isFinished) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        const completedStep = steps[activeStepIndex];
        if (completedStep) {
          onMarkStepComplete(completedStep.stepNumber);
        }

        const nextIdx = activeStepIndex + 1;
        if (nextIdx < steps.length) {
          onStepIndexChange(nextIdx);
          return steps[nextIdx].durationSeconds;
        }

        setIsRunning(false);
        setIsFinished(true);
        return 0;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [
    isRunning,
    isFinished,
    activeStepIndex,
    steps,
    onMarkStepComplete,
    onStepIndexChange,
  ]);

  const totalRecipeSeconds = useMemo(
    () => steps.reduce((acc, s) => acc + s.durationSeconds, 0),
    [steps]
  );

  const elapsedSeconds = useMemo(() => {
    if (isFinished) return totalRecipeSeconds;
    const priorSeconds = steps
      .slice(0, activeStepIndex)
      .reduce((acc, s) => acc + s.durationSeconds, 0);
    const currentDuration = currentStep?.durationSeconds ?? 0;
    return priorSeconds + Math.max(0, currentDuration - secondsLeft);
  }, [steps, activeStepIndex, currentStep, secondsLeft, isFinished, totalRecipeSeconds]);

  const phaseDuration = currentStep?.durationSeconds || 1;
  const phaseRatio = isFinished
    ? 1
    : Math.min(1, Math.max(0, (phaseDuration - secondsLeft) / phaseDuration));

  // Circular gauge math
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference * (1 - phaseRatio);

  const handleSelectPhase = (idx: number) => {
    setIsFinished(false);
    onStepIndexChange(idx);
    setSecondsLeft(steps[idx]?.durationSeconds ?? 30);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsFinished(false);
    onResetProgress();
    setSecondsLeft(steps[0]?.durationSeconds ?? 30);
  };

  const currentPhaseLabel = currentStep
    ? inferPhaseLabel(currentStep, activeStepIndex, steps.length)
    : 'Complete';

  return (
    <section
      aria-label="Interactive brew timer"
      className="mt-6 rounded-xl border border-[#1F140E]/15 bg-[#1B130E] p-5 sm:p-6 text-[#FAF5EC]"
    >
      <div className="flex items-center justify-between gap-4 border-b border-[#EBDAC4]/12 pb-4">
        <div>
          <span className="text-xs font-semibold text-[#D9822B]">
            Guided Brew Timer
          </span>
          <h4 className="font-display text-xl font-semibold text-[#FAF5EC]">
            {isFinished
              ? 'Extraction Complete — Enjoy Your Cup'
              : `Phase ${activeStepIndex + 1} of ${steps.length}: ${currentPhaseLabel}`}
          </h4>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close brew timer"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#EBDAC4]/15 text-[#CBBBA8] transition-colors hover:bg-[#2A1E17] hover:text-[#FAF5EC] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Main Countdown + Circular Gauge */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
        <div className="sm:col-span-4 flex flex-col items-center justify-center">
          <div className="relative flex h-32 w-32 items-center justify-center">
            <svg
              className="h-32 w-32 -rotate-90"
              viewBox="0 0 120 120"
              aria-hidden="true"
            >
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="rgba(235, 218, 196, 0.14)"
                strokeWidth="7"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#D9822B"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                className="transition-[stroke-dashoffset] duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono text-2xl font-semibold text-[#FAF5EC] tabular-nums">
                {formatClock(secondsLeft)}
              </span>
              <span className="mt-0.5 text-[11px] font-medium text-[#B7A490]">
                {isFinished ? 'Done' : 'Remaining'}
              </span>
            </div>
          </div>

          <div className="mt-3 font-mono text-xs text-[#B7A490] tabular-nums">
            Total {formatClock(elapsedSeconds)} / {formatClock(totalRecipeSeconds)}
          </div>
        </div>

        <div className="sm:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h5 className="font-display text-lg font-semibold text-[#FAF5EC]">
                {currentStep?.title}
              </h5>
              {typeof currentStep?.targetWeightGrams === 'number' && (
                <span className="font-mono text-xs font-semibold text-[#D9822B] tabular-nums">
                  Scale Target: {currentStep.targetWeightGrams}g
                </span>
              )}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#D7C8B8]">
              {currentStep?.instruction}
            </p>
          </div>

          {/* Play / Pause / Step / Reset Controls */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (isFinished) {
                  handleReset();
                  setIsRunning(true);
                } else {
                  setIsRunning((r) => !r);
                }
              }}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#D9822B] px-4 py-2 text-xs font-semibold text-[#120C09] whitespace-nowrap transition-colors hover:bg-[#E89238] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF5EC]"
            >
              {isRunning ? (
                <>
                  <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  {isFinished ? 'Brew Again' : 'Play'}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#EBDAC4]/20 px-3.5 py-2 text-xs font-semibold text-[#FAF5EC] whitespace-nowrap transition-colors hover:bg-[#2A1E17] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset
            </button>

            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                disabled={activeStepIndex === 0}
                onClick={() => handleSelectPhase(Math.max(0, activeStepIndex - 1))}
                aria-label="Previous phase"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#EBDAC4]/15 text-[#CBBBA8] transition-colors hover:bg-[#2A1E17] hover:text-[#FAF5EC] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled={activeStepIndex >= steps.length - 1}
                onClick={() =>
                  handleSelectPhase(Math.min(steps.length - 1, activeStepIndex + 1))
                }
                aria-label="Next phase"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#EBDAC4]/15 text-[#CBBBA8] transition-colors hover:bg-[#2A1E17] hover:text-[#FAF5EC] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Phase Selector Strip */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 border-t border-[#EBDAC4]/12 pt-4">
        {steps.map((step, idx) => {
          const isCurrent = idx === activeStepIndex && !isFinished;
          const isDone = completedSteps.includes(step.stepNumber) || isFinished;
          const phaseName = inferPhaseLabel(step, idx, steps.length);

          return (
            <button
              key={step.stepNumber}
              type="button"
              onClick={() => handleSelectPhase(idx)}
              className={`flex flex-col items-start rounded-lg border px-3 py-2 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B] ${
                isCurrent
                  ? 'border-[#D9822B] bg-[#D9822B]/15 text-[#FAF5EC]'
                  : isDone
                  ? 'border-[#EBDAC4]/15 bg-[#251A13] text-[#CBBBA8]'
                  : 'border-[#EBDAC4]/10 bg-[#140E0A] text-[#9E8B78] hover:border-[#EBDAC4]/25 hover:text-[#FAF5EC]'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-1 font-mono text-[11px] tabular-nums">
                <span className={isCurrent ? 'text-[#D9822B] font-semibold' : ''}>
                  0{step.stepNumber}
                </span>
                <span>{formatClock(step.durationSeconds)}</span>
              </div>
              <span className="mt-0.5 line-clamp-1 text-xs font-semibold">
                {phaseName}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
