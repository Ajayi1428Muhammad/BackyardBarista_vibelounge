import { Coffee, Trash2 } from 'lucide-react';
import { EXTRACTION_REFERENCE } from '../data/presets';
import { CoffeeRecipe } from '../types/coffee';

interface SavedBrewsAndGuideProps {
  savedRecipes: CoffeeRecipe[];
  activeRecipeId: string;
  onLoadRecipe: (recipe: CoffeeRecipe) => void;
  onDeleteRecipe: (id: string) => void;
}

export function SavedBrewsAndGuide({
  savedRecipes,
  activeRecipeId,
  onLoadRecipe,
  onDeleteRecipe,
}: SavedBrewsAndGuideProps) {
  return (
    <div className="space-y-20">
      {/* Recipe Journal */}
      <section id="saved-brews" className="scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#EBDAC4]/12 pb-5">
          <div>
            <h2 className="font-display text-3xl font-semibold text-[#FAF5EC]">
              Recipe Journal
            </h2>
            <p className="mt-1.5 text-sm text-[#B7A490]">
              Revisit your favorite custom recipes and load them back onto the bar card.
            </p>
          </div>
          <span className="font-mono text-xs text-[#9E8B78] tabular-nums">
            {savedRecipes.length} {savedRecipes.length === 1 ? 'recipe' : 'recipes'} saved locally
          </span>
        </div>

        {savedRecipes.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#EBDAC4]/10 bg-[#1B130E] px-6 py-10 text-center">
            <p className="font-display text-lg font-medium text-[#FAF5EC]">
              Your recipe journal is waiting for its first pour.
            </p>
            <p className="mt-1.5 text-sm text-[#9E8B78]">
              Craft a custom recipe above and click “Save to Journal” to pin it here for tomorrow morning.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedRecipes.map((item) => {
              const isCurrent = item.id === activeRecipeId;
              return (
                <div
                  key={item.id}
                  className={`flex flex-col justify-between rounded-2xl border p-6 transition-colors ${
                    isCurrent
                      ? 'border-[#D9822B] bg-[#241913]'
                      : 'border-[#EBDAC4]/12 bg-[#1B130E] hover:border-[#EBDAC4]/25'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-[#9E8B78]">
                      <span>
                        {item.request.brewMethod} · {item.request.roastLevel}
                      </span>
                      <span className="font-mono tabular-nums text-[#D9822B]">
                        {item.ratioLabel}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-xl font-semibold text-[#FAF5EC]">
                      {item.drinkName}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[#B7A490]">
                      {item.tagline}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#EBDAC4]/10 pt-4">
                    <span className="font-mono text-xs text-[#CBBBA8] tabular-nums">
                      {item.coffeeGrams}g / {item.waterGrams}g · {item.waterTempC}°C
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onDeleteRecipe(item.id)}
                        aria-label={`Remove ${item.drinkName} from journal`}
                        className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg text-[#9E8B78] transition-colors hover:bg-[#2E2018] hover:text-[#E57368] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B]"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onLoadRecipe(item)}
                        className="min-h-[38px] rounded-lg bg-[#FAF5EC] px-3.5 py-1.5 text-xs font-semibold text-[#120C09] whitespace-nowrap transition-colors hover:bg-[#D9822B] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B]"
                      >
                        {isCurrent ? 'Viewing' : 'Load Card'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Brew Method Extraction Guide */}
      <section
        id="brew-guide"
        className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch"
      >
        <div className="lg:col-span-5 overflow-hidden rounded-2xl border border-[#EBDAC4]/12 bg-[#1B130E]">
          <div className="relative h-full min-h-[280px]">
            <img
              src="/src/assets/images/espresso_crema_craft_1794575801585.jpg"
              alt="Brass dosing cup with roasted beans, matte black gooseneck kettle, and fresh espresso on dark walnut wood"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#120C09]/85 via-[#120C09]/25 to-transparent" />
            <div className="absolute bottom-5 left-6 right-6">
              <div className="flex items-center gap-2 text-xs font-medium text-[#D9822B]">
                <Coffee className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Barista Calibration</span>
              </div>
              <p className="mt-1 font-display text-xl font-semibold text-[#FAF5EC]">
                Precision begins with a digital gram scale and fresh burr grind.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col justify-center rounded-2xl border border-[#EBDAC4]/12 bg-[#1B130E] p-6 sm:p-8">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#FAF5EC]">
            House Extraction Baselines
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#B7A490]">
            Our AI barista dynamically adjusts these starting ratios based on roast solubility, milk pairing, and your requested flavor intensity.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#EBDAC4]/15 text-xs font-semibold text-[#9E8B78]">
                  <th className="py-3 pr-4">Method</th>
                  <th className="py-3 px-3">Ratio</th>
                  <th className="py-3 px-3">Dose : Water</th>
                  <th className="py-3 px-3">Grind</th>
                  <th className="py-3 px-3">Temp</th>
                  <th className="py-3 pl-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBDAC4]/10 text-[#E6D9CA]">
                {EXTRACTION_REFERENCE.map((row) => (
                  <tr key={row.method}>
                    <td className="py-3.5 pr-4 font-semibold text-[#FAF5EC] whitespace-nowrap">
                      {row.method}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs text-[#D9822B] tabular-nums whitespace-nowrap">
                      {row.ratio}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs tabular-nums whitespace-nowrap">
                      {row.doseWater}
                    </td>
                    <td className="py-3.5 px-3 text-xs text-[#B7A490] whitespace-nowrap">
                      {row.grind}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs tabular-nums whitespace-nowrap">
                      {row.temp}
                    </td>
                    <td className="py-3.5 pl-3 text-right font-mono text-xs tabular-nums whitespace-nowrap">
                      {row.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
