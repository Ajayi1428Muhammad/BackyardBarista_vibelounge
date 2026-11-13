import { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { CraftWorkbench } from './components/CraftWorkbench';
import { JournalDrawer } from './components/JournalDrawer';
import { Navbar } from './components/Navbar';
import { RecipeCard } from './components/RecipeCard';
import { SavedBrewsAndGuide } from './components/SavedBrewsAndGuide';
import { SIGNATURE_RECIPE } from './data/presets';
import {
  BrewMethod,
  CoffeeRecipe,
  CraftRecipeRequest,
  FlavorNote,
  MilkAlternative,
  RoastLevel,
} from './types/coffee';

const STORAGE_KEY = 'backyard_barista_saved_recipes_v1';

const DEFAULT_FORM: CraftRecipeRequest = {
  flavorNotes: ['Sweet', 'Nutty'],
  roastLevel: 'Medium',
  brewMethod: 'Pour-Over V60',
  milkAlternative: 'Oat',
  craving: '',
  servings: 1,
};

export default function App() {
  const [formState, setFormState] = useState<CraftRecipeRequest>(DEFAULT_FORM);
  const [activeRecipe, setActiveRecipe] = useState<CoffeeRecipe>(SIGNATURE_RECIPE);
  const [savedRecipes, setSavedRecipes] = useState<CoffeeRecipe[]>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isJournalOpen, setIsJournalOpen] = useState(false);

  const studioRef = useRef<HTMLElement | null>(null);
  const recipeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRecipes));
    } catch {
      // Ignore storage quota errors
    }
  }, [savedRecipes]);

  const scrollToStudio = () => {
    studioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleToggleFlavor = (flavor: FlavorNote) => {
    setFormState((prev) => {
      const exists = prev.flavorNotes.includes(flavor);
      if (exists && prev.flavorNotes.length === 1) {
        return prev; // Keep at least one flavor selected
      }
      const next = exists
        ? prev.flavorNotes.filter((f) => f !== flavor)
        : [...prev.flavorNotes, flavor];
      return { ...prev, flavorNotes: next };
    });
  };

  const handleSelectRoast = (roastLevel: RoastLevel) => {
    setFormState((prev) => ({ ...prev, roastLevel }));
  };

  const handleSelectMethod = (brewMethod: BrewMethod) => {
    setFormState((prev) => ({ ...prev, brewMethod }));
  };

  const handleSelectMilk = (milkAlternative: MilkAlternative) => {
    setFormState((prev) => ({ ...prev, milkAlternative }));
  };

  const handleChangeServings = (servings: 1 | 2) => {
    setFormState((prev) => ({ ...prev, servings }));
  };

  const handleChangeCraving = (craving: string) => {
    setFormState((prev) => ({ ...prev, craving }));
  };

  const handleReset = () => {
    setFormState(DEFAULT_FORM);
    setError(null);
  };

  const handleCraftRecipe = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/craft-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Could not generate recipe. Please try again.');
      }
      if (!data?.recipe) {
        throw new Error('Unexpected response format from barista service.');
      }

      setActiveRecipe(data.recipe);
      if (window.innerWidth < 1024) {
        recipeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to reach our barista service. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecipe = (recipe: CoffeeRecipe) => {
    setSavedRecipes((prev) => {
      const exists = prev.some((r) => r.id === recipe.id);
      if (exists) {
        return prev.filter((r) => r.id !== recipe.id);
      }
      return [recipe, ...prev];
    });
  };

  const handleLoadRecipe = (recipe: CoffeeRecipe) => {
    setActiveRecipe(recipe);
    if (recipe.request) {
      setFormState({
        flavorNotes: recipe.request.flavorNotes?.length
          ? recipe.request.flavorNotes
          : ['Sweet'],
        roastLevel: recipe.request.roastLevel ?? 'Medium',
        brewMethod: recipe.request.brewMethod ?? 'Pour-Over V60',
        milkAlternative: recipe.request.milkAlternative ?? 'Black',
        craving: recipe.request.craving ?? '',
        servings: recipe.request.servings === 2 ? 2 : 1,
      });
    }
    recipeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDeleteRecipe = (id: string) => {
    setSavedRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  const isCurrentSaved = savedRecipes.some((r) => r.id === activeRecipe.id);

  return (
    <div id="top" className="min-h-screen bg-[#120C09] text-[#F5EDE2]">
      <Navbar
        onCraftFocus={scrollToStudio}
        onOpenJournal={() => setIsJournalOpen(true)}
        savedCount={savedRecipes.length}
      />

      <main>
        {/* Editorial Café Hero Split */}
        <section className="border-b border-[#EBDAC4]/10 bg-gradient-to-b from-[#170F0B] to-[#120C09]">
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 px-6 py-12 lg:py-16 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-semibold tracking-wide text-[#D9822B]">
                Specialty Coffee Crafting Studio
              </p>
              <h1 className="mt-3 font-display text-4xl sm:text-5xl lg:text-[3.35rem] font-semibold leading-[1.08] tracking-tight text-[#FAF5EC] text-balance">
                Bespoke café recipes, dialed to the gram.
              </h1>
              <p className="mt-5 max-w-[54ch] text-base sm:text-lg leading-relaxed text-[#CBBBA8]">
                Choose your flavor notes, roast profile, brewer, and milk preference. Our expert AI barista calibrates exact coffee-to-water ratios, grind size, water temperature, and timed pouring steps for your morning cup.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-[#9E8B78]">
                <span>Exact Gram Ratios</span>
                <span aria-hidden="true">·</span>
                <span>4 Specialty Brewers</span>
                <span aria-hidden="true">·</span>
                <span>Live Step Timer</span>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={scrollToStudio}
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[#D9822B] px-6 py-3 text-sm font-semibold text-[#120C09] whitespace-nowrap transition-colors hover:bg-[#E89238] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF5EC] focus-visible:ring-offset-2 focus-visible:ring-offset-[#120C09]"
                >
                  Start Crafting
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </button>
                <a
                  href="#recipe-card"
                  className="inline-flex min-h-[46px] items-center rounded-xl border border-[#EBDAC4]/20 px-5 py-3 text-sm font-semibold text-[#FAF5EC] whitespace-nowrap transition-colors hover:border-[#D9822B] hover:text-[#D9822B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B]"
                >
                  View Signature Card
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-full min-h-[280px] sm:min-h-[360px] overflow-hidden rounded-2xl border border-[#EBDAC4]/12 bg-[#1B130E]">
                <img
                  src="/src/assets/images/barista_hero_pour_1794575801172.jpg"
                  alt="Barista pouring hot water from a gooseneck kettle into a glass V60 dripper on a sunlit backyard patio wood counter"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#120C09]/80 via-[#120C09]/20 to-transparent" />
                <div className="absolute bottom-5 left-6 right-6 flex flex-wrap items-baseline justify-between gap-2 text-xs text-[#EBDAC4]">
                  <span className="font-medium">
                    Backyard Patio Bar · Morning Extraction
                  </span>
                  <span className="font-mono text-[#D9822B] tabular-nums">
                    18g : 288g · 92°C
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Craft Studio + Warm Cream Recipe Card */}
        <section
          id="craft-studio"
          ref={studioRef}
          className="scroll-mt-20 mx-auto max-w-[1200px] px-6 py-14 lg:py-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-5">
              <CraftWorkbench
                formState={formState}
                isLoading={isLoading}
                error={error}
                onToggleFlavor={handleToggleFlavor}
                onSelectRoast={handleSelectRoast}
                onSelectMethod={handleSelectMethod}
                onSelectMilk={handleSelectMilk}
                onChangeServings={handleChangeServings}
                onChangeCraving={handleChangeCraving}
                onSubmit={handleCraftRecipe}
                onReset={handleReset}
              />
            </div>

            <div
              id="recipe-card"
              ref={recipeRef}
              className="scroll-mt-24 lg:col-span-7 lg:sticky lg:top-24"
            >
              <RecipeCard
                recipe={activeRecipe}
                isLoading={isLoading}
                isSaved={isCurrentSaved}
                savedCount={savedRecipes.length}
                onSave={handleSaveRecipe}
                onOpenJournal={() => setIsJournalOpen(true)}
              />
            </div>
          </div>
        </section>

        {/* Saved Brews & Extraction Reference */}
        <section className="mx-auto max-w-[1200px] px-6 pb-20">
          <SavedBrewsAndGuide
            savedRecipes={savedRecipes}
            activeRecipeId={activeRecipe.id}
            onLoadRecipe={handleLoadRecipe}
            onDeleteRecipe={handleDeleteRecipe}
          />
        </section>
      </main>

      <footer className="border-t border-[#EBDAC4]/10 bg-[#0E0907]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs text-[#9E8B78]">
          <span className="font-display text-sm font-medium text-[#E6D9CA]">
            The Backyard Barista
          </span>
          <div className="flex items-center gap-6">
            <a
              href="#craft-studio"
              className="transition-colors hover:text-[#FAF5EC]"
            >
              Craft Studio
            </a>
            <a
              href="#saved-brews"
              className="transition-colors hover:text-[#FAF5EC]"
            >
              Journal
            </a>
            <a
              href="#top"
              className="transition-colors hover:text-[#FAF5EC]"
            >
              Back to Top
            </a>
          </div>
        </div>
      </footer>

      <JournalDrawer
        isOpen={isJournalOpen}
        savedRecipes={savedRecipes}
        activeRecipeId={activeRecipe.id}
        onClose={() => setIsJournalOpen(false)}
        onLoadRecipe={handleLoadRecipe}
        onDeleteRecipe={handleDeleteRecipe}
      />
    </div>
  );
}
