import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Trash2, X } from 'lucide-react';
import { BrewMethod, CoffeeRecipe } from '../types/coffee';

interface JournalDrawerProps {
  isOpen: boolean;
  savedRecipes: CoffeeRecipe[];
  activeRecipeId: string;
  onClose: () => void;
  onLoadRecipe: (recipe: CoffeeRecipe) => void;
  onDeleteRecipe: (id: string) => void;
}

const METHOD_FILTERS: ('All' | BrewMethod)[] = [
  'All',
  'Pour-Over V60',
  'Espresso',
  'French Press',
  'AeroPress',
];

function formatSavedDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export function JournalDrawer({
  isOpen,
  savedRecipes,
  activeRecipeId,
  onClose,
  onLoadRecipe,
  onDeleteRecipe,
}: JournalDrawerProps) {
  const [methodFilter, setMethodFilter] = useState<'All' | BrewMethod>('All');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredRecipes = useMemo(() => {
    if (methodFilter === 'All') return savedRecipes;
    return savedRecipes.filter((r) => r.request.brewMethod === methodFilter);
  }, [savedRecipes, methodFilter]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Saved Recipe Journal"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0A0604]/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-[#EBDAC4]/15 bg-[#160F0B] text-[#FAF5EC] shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-[#EBDAC4]/12 px-6 py-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D9822B]">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Recipe Journal</span>
            </div>
            <h2 className="mt-0.5 font-display text-2xl font-semibold text-[#FAF5EC]">
              Saved Journal
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Saved Journal"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#EBDAC4]/15 text-[#CBBBA8] transition-colors hover:bg-[#261A13] hover:text-[#FAF5EC] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Method Filter Bar */}
        <div className="border-b border-[#EBDAC4]/10 px-6 py-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {METHOD_FILTERS.map((method) => {
              const active = methodFilter === method;
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => setMethodFilter(method)}
                  className={`min-h-[34px] rounded-lg px-3 py-1 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B] ${
                    active
                      ? 'bg-[#D9822B] text-[#120C09]'
                      : 'bg-[#221711] text-[#CBBBA8] hover:text-[#FAF5EC]'
                  }`}
                >
                  {method}
                </button>
              );
            })}
          </div>
        </div>

        {/* Saved Entries List */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {savedRecipes.length === 0 ? (
            <div className="rounded-xl border border-[#EBDAC4]/10 bg-[#1E140F] p-6 text-center">
              <p className="font-display text-lg font-medium text-[#FAF5EC]">
                No saved creations yet
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#9E8B78]">
                Click “Save to Journal” on any crafted recipe card to keep your favorite ratios and steps here.
              </p>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="rounded-xl border border-[#EBDAC4]/10 bg-[#1E140F] p-6 text-center">
              <p className="text-sm text-[#B7A490]">
                No saved {methodFilter} recipes yet.
              </p>
              <button
                type="button"
                onClick={() => setMethodFilter('All')}
                className="mt-2 text-xs font-semibold text-[#D9822B] hover:underline cursor-pointer"
              >
                Show all {savedRecipes.length} saved recipes
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {filteredRecipes.map((item) => {
                const isCurrent = item.id === activeRecipeId;
                const savedDate = formatSavedDate(item.createdAt);
                return (
                  <li
                    key={item.id}
                    className={`rounded-xl border p-4 transition-colors ${
                      isCurrent
                        ? 'border-[#D9822B] bg-[#241913]'
                        : 'border-[#EBDAC4]/12 bg-[#1D140E] hover:border-[#EBDAC4]/25'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] text-[#9E8B78]">
                      <span>
                        {item.request.brewMethod} · {item.request.roastLevel} ·{' '}
                        {item.request.milkAlternative}
                      </span>
                      {savedDate && (
                        <span className="font-mono tabular-nums shrink-0">
                          {savedDate}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-1.5 font-display text-lg font-semibold text-[#FAF5EC]">
                      {item.drinkName}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#B7A490]">
                      {item.tagline}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-[#D9822B] tabular-nums">
                      <span>
                        {item.coffeeGrams}g : {item.waterGrams}g
                      </span>
                      <span aria-hidden="true" className="text-[#7A6252]">
                        ·
                      </span>
                      <span>{item.ratioLabel}</span>
                      <span aria-hidden="true" className="text-[#7A6252]">
                        ·
                      </span>
                      <span className="text-[#CBBBA8]">{item.waterTempC}°C</span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#EBDAC4]/10 pt-3">
                      <button
                        type="button"
                        onClick={() => onDeleteRecipe(item.id)}
                        aria-label={`Delete ${item.drinkName} from journal`}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#9E8B78] transition-colors hover:bg-[#2E2018] hover:text-[#E57368] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Remove
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onLoadRecipe(item);
                          onClose();
                        }}
                        className="min-h-[36px] rounded-lg bg-[#FAF5EC] px-3.5 py-1.5 text-xs font-semibold text-[#120C09] whitespace-nowrap transition-colors hover:bg-[#D9822B] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B]"
                      >
                        {isCurrent ? 'Currently Active' : 'Load Recipe'}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-[#EBDAC4]/12 px-6 py-4 flex items-center justify-between text-xs text-[#9E8B78]">
          <span className="font-mono tabular-nums">
            {savedRecipes.length} {savedRecipes.length === 1 ? 'entry' : 'entries'} stored
          </span>
          <a
            href="#saved-brews"
            onClick={onClose}
            className="font-semibold text-[#D9822B] hover:underline"
          >
            Jump to full grid
          </a>
        </div>
      </aside>
    </div>
  );
}
