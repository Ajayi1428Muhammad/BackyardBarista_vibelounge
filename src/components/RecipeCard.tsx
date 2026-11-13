import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  BookOpen,
  Check,
  Copy,
  ListChecks,
  Timer,
} from 'lucide-react';
import { CoffeeRecipe } from '../types/coffee';
import { BrewTimerPanel } from './BrewTimerPanel';
import { ShoppingListPanel } from './ShoppingListPanel';

interface RecipeCardProps {
  recipe: CoffeeRecipe;
  isLoading: boolean;
  isSaved: boolean;
  savedCount: number;
  onSave: (recipe: CoffeeRecipe) => void;
  onOpenJournal: () => void;
}

function formatSeconds(totalSec: number): string {
  const safe = Math.max(0, totalSec);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function buildEmojiRecipeSummary(recipe: CoffeeRecipe): string {
  const milkText =
    recipe.request.milkAlternative === 'Black'
      ? 'Served Black (No Milk)'
      : recipe.milkDescription;

  const stepLines = recipe.steps.map((s) => {
    const weightNote =
      typeof s.targetWeightGrams === 'number'
        ? ` · Scale: ${s.targetWeightGrams}g`
        : '';
    return `  ${s.stepNumber}. ${s.title} (${formatSeconds(s.durationSeconds)}${weightNote})\n     ${s.instruction}`;
  });

  return [
    `☕ ${recipe.drinkName}`,
    `✨ ${recipe.tagline}`,
    '',
    `🔥 Method & Roast: ${recipe.request.brewMethod} · ${recipe.request.roastLevel} Roast`,
    `🎨 Flavor Notes: ${recipe.request.flavorNotes.join(', ')}`,
    `🌱 Origin Pairing: ${recipe.originRecommendation}`,
    '',
    `⚖️ Ratio: ${recipe.coffeeGrams}g coffee : ${recipe.waterGrams}g water (${recipe.ratioLabel})`,
    `⚙️ Grind Size: ${recipe.grindSize}`,
    `🌡️ Water Temp: ${recipe.waterTempC}°C / ${recipe.waterTempF}°F`,
    `⏱️ Brew Time & Yield: ${recipe.totalBrewTime} · ${recipe.totalYield}`,
    `🥛 Milk & Finish: ${milkText}`,
    '',
    `📋 Brewing Steps:`,
    ...stepLines,
    '',
    `💡 Barista's Note: ${recipe.baristaTip}`,
    `— Crafted with The Backyard Barista`,
  ].join('\n');
}

export function RecipeCard({
  recipe,
  isLoading,
  isSaved,
  savedCount,
  onSave,
  onOpenJournal,
}: RecipeCardProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedJustNow, setCopiedJustNow] = useState(false);
  const [showBrewTimer, setShowBrewTimer] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const toastTimerRef = useRef<number | null>(null);

  const triggerToast = useCallback((message: string) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2600);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Reset per-recipe transient states when a new recipe loads
  useEffect(() => {
    setCompletedSteps([]);
    setActiveStepIndex(0);
    setShowBrewTimer(false);
    setShowShoppingList(false);
  }, [recipe.id]);

  const toggleStepComplete = useCallback((stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber)
        ? prev.filter((n) => n !== stepNumber)
        : [...prev, stepNumber]
    );
  }, []);

  const markStepComplete = useCallback((stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber) ? prev : [...prev, stepNumber]
    );
  }, []);

  const resetProgress = useCallback(() => {
    setCompletedSteps([]);
    setActiveStepIndex(0);
  }, []);

  const handleCopyRecipe = async () => {
    const summary = buildEmojiRecipeSummary(recipe);
    try {
      await navigator.clipboard.writeText(summary);
      setCopiedJustNow(true);
      triggerToast('Copied!');
      window.setTimeout(() => setCopiedJustNow(false), 2400);
    } catch {
      triggerToast('Unable to access clipboard');
    }
  };

  const handleToggleTimer = () => {
    setShowBrewTimer((prev) => {
      const next = !prev;
      if (next) setShowShoppingList(false);
      return next;
    });
  };

  const handleToggleShoppingList = () => {
    setShowShoppingList((prev) => {
      const next = !prev;
      if (next) setShowBrewTimer(false);
      return next;
    });
  };

  return (
    <>
      <article
        aria-busy={isLoading}
        className="relative overflow-hidden rounded-2xl bg-[#F8F1E5] text-[#1F140E] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.65)]"
      >
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#F8F1E5]/88 backdrop-blur-[2px] px-6 text-center">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#1F140E]/20 border-t-[#D9822B]" />
            <p className="mt-4 font-display text-xl font-semibold text-[#1F140E]">
              Calibrating grind, ratio &amp; pour curve...
            </p>
            <p className="mt-1 text-sm text-[#6E5849]">
              Tailoring extraction to your {recipe.request.brewMethod} setup.
            </p>
          </div>
        )}

        <div className="p-6 sm:p-9">
          {/* Unboxed metadata kicker — zero-pill rule */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F140E]/12 pb-5">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-[#6E5849]">
              <span>{recipe.request.brewMethod}</span>
              <span aria-hidden="true">·</span>
              <span>{recipe.request.roastLevel} Roast</span>
              <span aria-hidden="true">·</span>
              <span>
                {recipe.request.milkAlternative === 'Black'
                  ? 'Served Black'
                  : `${recipe.request.milkAlternative} Milk`}
              </span>
              <span aria-hidden="true">·</span>
              <span>{recipe.request.flavorNotes.join(', ')}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onOpenJournal}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#1F140E]/15 px-3 py-1.5 text-xs font-semibold text-[#1F140E] whitespace-nowrap shrink-0 transition-colors hover:bg-[#EFE6D8] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B]"
              >
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                Saved Journal{savedCount > 0 ? ` (${savedCount})` : ''}
              </button>

              <button
                type="button"
                onClick={() => {
                  onSave(recipe);
                  triggerToast(
                    isSaved ? 'Removed from Journal' : 'Saved to Journal!'
                  );
                }}
                className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B] ${
                  isSaved
                    ? 'bg-[#1F140E] text-[#FAF5EC]'
                    : 'border border-[#1F140E]/15 text-[#1F140E] hover:bg-[#EFE6D8]'
                }`}
              >
                <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                {isSaved ? 'Saved in Journal' : 'Save to Journal'}
              </button>
            </div>
          </div>

          {/* Drink Name & Tasting Description */}
          <div className="mt-6">
            <h3 className="font-display text-3xl sm:text-4xl font-semibold leading-tight tracking-tight text-[#1F140E] text-balance">
              {recipe.drinkName}
            </h3>
            <p className="mt-2.5 max-w-[65ch] text-base leading-relaxed text-[#4C392D]">
              {recipe.tagline}
            </p>
            <p className="mt-2 text-xs font-medium text-[#7A6252]">
              Recommended Bean: {recipe.originRecommendation}
            </p>
          </div>

          {/* Recipe Action Bar: Start Brew Timer, Shopping List, Copy Recipe */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              aria-expanded={showBrewTimer}
              onClick={handleToggleTimer}
              className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B] ${
                showBrewTimer
                  ? 'bg-[#1F140E] text-[#FAF5EC]'
                  : 'bg-[#D9822B] text-[#120C09] hover:bg-[#E89238]'
              }`}
            >
              <Timer className="h-4 w-4" aria-hidden="true" />
              {showBrewTimer ? 'Hide Brew Timer' : 'Start Brew Timer'}
            </button>

            <button
              type="button"
              aria-expanded={showShoppingList}
              onClick={handleToggleShoppingList}
              className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl border px-4 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B] ${
                showShoppingList
                  ? 'border-[#1F140E] bg-[#1F140E] text-[#FAF5EC]'
                  : 'border-[#1F140E]/20 bg-transparent text-[#1F140E] hover:bg-[#EFE6D8]'
              }`}
            >
              <ListChecks className="h-4 w-4" aria-hidden="true" />
              Shopping List
            </button>

            <button
              type="button"
              onClick={handleCopyRecipe}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-[#1F140E]/20 px-4 py-2 text-xs sm:text-sm font-semibold text-[#1F140E] whitespace-nowrap shrink-0 transition-colors hover:bg-[#EFE6D8] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B]"
            >
              {copiedJustNow ? (
                <>
                  <Check className="h-4 w-4 text-[#A45B12]" aria-hidden="true" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  Copy Recipe
                </>
              )}
            </button>
          </div>

          {/* Expandable Feature 1: Real-Time Visual Brew Timer */}
          {showBrewTimer && (
            <BrewTimerPanel
              recipe={recipe}
              activeStepIndex={activeStepIndex}
              completedSteps={completedSteps}
              onStepIndexChange={setActiveStepIndex}
              onMarkStepComplete={markStepComplete}
              onResetProgress={resetProgress}
              onClose={() => setShowBrewTimer(false)}
            />
          )}

          {/* Expandable Feature 2: Interactive Checkable Shopping List */}
          {showShoppingList && (
            <ShoppingListPanel
              recipe={recipe}
              onClose={() => setShowShoppingList(false)}
              onCopiedToast={triggerToast}
            />
          )}

          {/* Exact Brew Specifications Strip */}
          <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 border-y border-[#1F140E]/12 divide-y sm:divide-y-0 sm:divide-x divide-[#1F140E]/12">
            <div className="py-4 sm:pr-4">
              <div className="text-xs font-medium text-[#6E5849]">
                Coffee : Water
              </div>
              <div className="mt-1 font-mono text-lg sm:text-xl font-semibold text-[#1F140E] tabular-nums">
                {recipe.coffeeGrams}g : {recipe.waterGrams}g
              </div>
              <div className="mt-0.5 font-mono text-xs font-medium text-[#A45B12] tabular-nums">
                Ratio {recipe.ratioLabel}
              </div>
            </div>

            <div className="py-4 sm:px-4">
              <div className="text-xs font-medium text-[#6E5849]">
                Grind Size
              </div>
              <div className="mt-1 text-sm font-semibold leading-snug text-[#1F140E]">
                {recipe.grindSize}
              </div>
            </div>

            <div className="py-4 sm:px-4">
              <div className="text-xs font-medium text-[#6E5849]">
                Water Temperature
              </div>
              <div className="mt-1 font-mono text-lg sm:text-xl font-semibold text-[#1F140E] tabular-nums">
                {recipe.waterTempC}°C
              </div>
              <div className="mt-0.5 font-mono text-xs text-[#6E5849] tabular-nums">
                {recipe.waterTempF}°F kettle target
              </div>
            </div>

            <div className="py-4 sm:pl-4">
              <div className="text-xs font-medium text-[#6E5849]">
                Brew Time &amp; Yield
              </div>
              <div className="mt-1 font-mono text-lg sm:text-xl font-semibold text-[#1F140E] tabular-nums">
                {recipe.totalBrewTime}
              </div>
              <div className="mt-0.5 text-xs text-[#6E5849]">
                {recipe.totalYield}
              </div>
            </div>
          </div>

          {/* Milk / Serving Integration Row */}
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#1F140E]/12 py-3.5 text-sm">
            <span className="font-semibold text-[#1F140E]">
              Milk &amp; Finish
            </span>
            <span className="text-[#4C392D]">{recipe.milkDescription}</span>
          </div>

          {/* Numbered Brewing Steps */}
          <div className="mt-7 flex items-baseline justify-between gap-4 border-b border-[#1F140E]/12 pb-3">
            <h4 className="font-display text-xl font-semibold text-[#1F140E]">
              Numbered Brewing Steps
            </h4>
            <span className="font-mono text-xs text-[#6E5849] tabular-nums">
              {completedSteps.length} / {recipe.steps.length} complete
            </span>
          </div>

          <ol className="divide-y divide-[#1F140E]/10">
            {recipe.steps.map((step, index) => {
              const isDone = completedSteps.includes(step.stepNumber);
              const isActive = showBrewTimer && index === activeStepIndex;
              return (
                <li
                  key={step.stepNumber}
                  className={`py-4 transition-colors ${
                    isActive ? 'bg-[#EFE6D8]/85 -mx-3 px-3 rounded-lg' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => toggleStepComplete(step.stepNumber)}
                      aria-label={
                        isDone
                          ? `Mark step ${step.stepNumber} incomplete`
                          : `Mark step ${step.stepNumber} complete`
                      }
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-semibold tabular-nums transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B] ${
                        isDone
                          ? 'bg-[#1F140E] text-[#FAF5EC]'
                          : isActive
                          ? 'bg-[#D9822B] text-[#120C09]'
                          : 'border border-[#1F140E]/20 text-[#1F140E] hover:border-[#D9822B]'
                      }`}
                    >
                      {isDone ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        step.stepNumber.toString().padStart(2, '0')
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveStepIndex(index);
                            if (!showBrewTimer) setShowBrewTimer(true);
                          }}
                          className={`text-left text-base font-semibold transition-colors cursor-pointer hover:text-[#A45B12] ${
                            isDone
                              ? 'line-through text-[#7A6252]'
                              : 'text-[#1F140E]'
                          }`}
                        >
                          {step.title}
                        </button>

                        <div className="flex items-center gap-2 font-mono text-xs text-[#6E5849] tabular-nums">
                          {typeof step.targetWeightGrams === 'number' && (
                            <>
                              <span className="font-semibold text-[#A45B12]">
                                Scale {step.targetWeightGrams}g
                              </span>
                              <span aria-hidden="true">·</span>
                            </>
                          )}
                          <span>{formatSeconds(step.durationSeconds)}</span>
                        </div>
                      </div>

                      <p
                        className={`mt-1 text-sm leading-relaxed ${
                          isDone ? 'text-[#7A6252]' : 'text-[#4C392D]'
                        }`}
                      >
                        {step.instruction}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Barista Tip Footer */}
          <div className="mt-4 border-t border-[#1F140E]/15 pt-5">
            <div className="text-xs font-semibold text-[#A45B12]">
              Barista’s Note
            </div>
            <p className="mt-1 text-sm leading-relaxed text-[#3B2A20]">
              {recipe.baristaTip}
            </p>
          </div>
        </div>
      </article>

      {/* Copied! Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-[#D9822B]/50 bg-[#1B130E] px-4 py-3 text-sm font-semibold text-[#FAF5EC] shadow-[0_16px_40px_-10px_rgba(0,0,0,0.75)]"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#D9822B] text-[#120C09]">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
