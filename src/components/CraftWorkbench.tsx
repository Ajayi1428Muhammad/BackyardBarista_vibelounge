import { Loader2, RotateCcw } from 'lucide-react';
import {
  BREW_METHODS,
  CRAVING_INSPIRATIONS,
  FLAVOR_NOTES,
  MILK_ALTERNATIVES,
  ROAST_LEVELS,
} from '../data/presets';
import {
  BrewMethod,
  CraftRecipeRequest,
  FlavorNote,
  MilkAlternative,
  RoastLevel,
} from '../types/coffee';

interface CraftWorkbenchProps {
  formState: CraftRecipeRequest;
  isLoading: boolean;
  error: string | null;
  onToggleFlavor: (flavor: FlavorNote) => void;
  onSelectRoast: (roast: RoastLevel) => void;
  onSelectMethod: (method: BrewMethod) => void;
  onSelectMilk: (milk: MilkAlternative) => void;
  onChangeServings: (servings: 1 | 2) => void;
  onChangeCraving: (craving: string) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function CraftWorkbench({
  formState,
  isLoading,
  error,
  onToggleFlavor,
  onSelectRoast,
  onSelectMethod,
  onSelectMilk,
  onChangeServings,
  onChangeCraving,
  onSubmit,
  onReset,
}: CraftWorkbenchProps) {
  return (
    <div className="rounded-2xl border border-[#EBDAC4]/12 bg-[#1B130E] p-6 sm:p-8">
      <div className="flex items-baseline justify-between gap-4 border-b border-[#EBDAC4]/10 pb-5">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#FAF5EC]">
            Dial In Your Cup
          </h2>
          <p className="mt-1 text-sm text-[#B7A490]">
            Select your profile below and our AI barista will calibrate the recipe.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          disabled={isLoading}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-[#CBBBA8] whitespace-nowrap shrink-0 transition-colors hover:bg-[#271C15] hover:text-[#FAF5EC] disabled:opacity-50 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset
        </button>
      </div>

      <form
        className="mt-6 space-y-7"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        {/* 01. Flavor Notes */}
        <fieldset>
          <div className="flex items-baseline justify-between gap-2">
            <legend className="text-sm font-semibold text-[#FAF5EC]">
              01. Flavor Notes
            </legend>
            <span className="text-xs text-[#9E8B78]">
              Select one or more
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {FLAVOR_NOTES.map((item) => {
              const active = formState.flavorNotes.includes(item.label);
              return (
                <button
                  key={item.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onToggleFlavor(item.label)}
                  className={`group flex min-h-[44px] flex-col items-start justify-center rounded-xl border px-3.5 py-2.5 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B] ${
                    active
                      ? 'border-[#D9822B] bg-[#D9822B]/14 text-[#FAF5EC]'
                      : 'border-[#EBDAC4]/12 bg-[#140E0A] text-[#CBBBA8] hover:border-[#EBDAC4]/25 hover:text-[#FAF5EC]'
                  }`}
                >
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {item.label}
                  </span>
                  <span className="mt-0.5 line-clamp-1 text-[11px] text-[#9E8B78]">
                    {item.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* 02. Roast Level */}
        <fieldset>
          <legend className="text-sm font-semibold text-[#FAF5EC]">
            02. Roast Level
          </legend>
          <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-[#EBDAC4]/12 bg-[#140E0A] p-1.5">
            {ROAST_LEVELS.map((roast) => {
              const active = formState.roastLevel === roast.label;
              return (
                <button
                  key={roast.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelectRoast(roast.label)}
                  className={`flex min-h-[44px] flex-col items-center justify-center rounded-lg px-3 py-2 text-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B] ${
                    active
                      ? 'bg-[#D9822B] text-[#120C09]'
                      : 'text-[#CBBBA8] hover:bg-[#221812] hover:text-[#FAF5EC]'
                  }`}
                >
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {roast.label}
                  </span>
                  <span
                    className={`mt-0.5 text-[11px] leading-tight hidden sm:block ${
                      active ? 'text-[#1F140E]/80 font-medium' : 'text-[#8D7A68]'
                    }`}
                  >
                    {roast.note}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* 03. Brew Method */}
        <fieldset>
          <legend className="text-sm font-semibold text-[#FAF5EC]">
            03. Brew Method
          </legend>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {BREW_METHODS.map((method) => {
              const active = formState.brewMethod === method.label;
              return (
                <button
                  key={method.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelectMethod(method.label)}
                  className={`flex min-h-[48px] flex-col items-start justify-center rounded-xl border px-3.5 py-2.5 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B] ${
                    active
                      ? 'border-[#D9822B] bg-[#D9822B]/14 text-[#FAF5EC]'
                      : 'border-[#EBDAC4]/12 bg-[#140E0A] text-[#CBBBA8] hover:border-[#EBDAC4]/25 hover:text-[#FAF5EC]'
                  }`}
                >
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {method.label}
                  </span>
                  <span className="mt-0.5 text-[11px] text-[#9E8B78]">
                    {method.detail}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* 04. Milk Alternative & Servings */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
          <fieldset className="sm:col-span-8">
            <legend className="text-sm font-semibold text-[#FAF5EC]">
              04. Milk Alternative
            </legend>
            <div className="mt-3 grid grid-cols-5 gap-1.5 rounded-xl border border-[#EBDAC4]/12 bg-[#140E0A] p-1.5">
              {MILK_ALTERNATIVES.map((milk) => {
                const active = formState.milkAlternative === milk;
                return (
                  <button
                    key={milk}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onSelectMilk(milk)}
                    className={`min-h-[42px] rounded-lg px-2 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B] ${
                      active
                        ? 'bg-[#D9822B] text-[#120C09]'
                        : 'text-[#CBBBA8] hover:bg-[#221812] hover:text-[#FAF5EC]'
                    }`}
                  >
                    {milk}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="sm:col-span-4">
            <legend className="text-sm font-semibold text-[#FAF5EC]">
              Servings
            </legend>
            <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-xl border border-[#EBDAC4]/12 bg-[#140E0A] p-1.5">
              {([1, 2] as const).map((count) => {
                const active = formState.servings === count;
                return (
                  <button
                    key={count}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onChangeServings(count)}
                    className={`min-h-[42px] rounded-lg px-2 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B] ${
                      active
                        ? 'bg-[#D9822B] text-[#120C09]'
                        : 'text-[#CBBBA8] hover:bg-[#221812] hover:text-[#FAF5EC]'
                    }`}
                  >
                    {count} {count === 1 ? 'Cup' : 'Cups'}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        {/* 05. Optional Craving Input */}
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <label
              htmlFor="craving-input"
              className="text-sm font-semibold text-[#FAF5EC]"
            >
              05. Craving or Mood (Optional)
            </label>
            <span className="text-xs text-[#9E8B78]">
              Temperature, spice, texture
            </span>
          </div>
          <textarea
            id="craving-input"
            rows={2}
            maxLength={280}
            value={formState.craving}
            onChange={(e) => onChangeCraving(e.target.value)}
            placeholder="e.g., Iced afternoon pick-me-up with a hint of brown sugar and citrus peel..."
            className="mt-3 w-full resize-none rounded-xl border border-[#EBDAC4]/15 bg-[#140E0A] px-4 py-3 text-sm text-[#FAF5EC] placeholder-[#7C6A58] transition-colors focus:border-[#D9822B] focus:outline-none focus:ring-1 focus:ring-[#D9822B]"
          />
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[#9E8B78]">
            <span>Try:</span>
            {CRAVING_INSPIRATIONS.slice(0, 2).map((idea) => (
              <button
                key={idea}
                type="button"
                onClick={() => onChangeCraving(idea)}
                className="text-left text-[#D9822B] underline decoration-[#D9822B]/40 underline-offset-4 transition-colors hover:text-[#F1A659] cursor-pointer"
              >
                {idea}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-[#E57368]/40 bg-[#3B1815] px-4 py-3 text-sm text-[#FCDAD6]"
          >
            {error}
          </div>
        )}

        <div className="pt-1">
          <button
            type="submit"
            disabled={isLoading}
            className="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-xl bg-[#D9822B] px-6 py-3.5 text-base font-semibold text-[#120C09] transition-colors hover:bg-[#E89238] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF5EC] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B130E]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Crafting Your Recipe...
              </>
            ) : (
              'Craft Custom Recipe'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
