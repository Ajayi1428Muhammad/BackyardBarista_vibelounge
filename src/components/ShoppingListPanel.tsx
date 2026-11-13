import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { BrewMethod, CoffeeRecipe } from '../types/coffee';

interface ShoppingListPanelProps {
  recipe: CoffeeRecipe;
  onClose: () => void;
  onCopiedToast: (message: string) => void;
}

interface GroceryItem {
  id: string;
  category: 'Coffee Beans' | 'Milk & Pantry' | 'Brewing Equipment';
  label: string;
  detail: string;
}

const EQUIPMENT_BY_METHOD: Record<BrewMethod, { label: string; detail: string }[]> = {
  Espresso: [
    { label: 'Espresso Machine & Portafilter', detail: '9-bar extraction ready' },
    { label: 'Calibrated Tamper', detail: 'Matching your basket diameter' },
    { label: 'Burr Coffee Grinder', detail: 'Capable of fine espresso range' },
    { label: 'Digital Gram Scale', detail: '0.1g precision for dose & yield' },
    { label: 'Steam Pitcher', detail: 'Stainless steel for microfoam' },
  ],
  'Pour-Over V60': [
    { label: 'Hario V60 Dripper & Carafe', detail: '02 size cone recommended' },
    { label: 'V60 Paper Cone Filters', detail: 'Unbleached or oxygen-bleached' },
    { label: 'Gooseneck Kettle', detail: 'Variable temp or thermometer' },
    { label: 'Burr Coffee Grinder', detail: 'Medium-fine consistency' },
    { label: 'Digital Gram Scale & Timer', detail: 'Tracks cumulative pour weight' },
  ],
  'French Press': [
    { label: 'Glass or Steel French Press', detail: '350ml–600ml immersion carafe' },
    { label: 'Burr Coffee Grinder', detail: 'Coarse, uniform sea-salt grind' },
    { label: 'Pouring Kettle', detail: 'Heats water to target temp' },
    { label: 'Digital Gram Scale', detail: 'Measures coffee & water grams' },
    { label: 'Cupping or Tasting Spoon', detail: 'For breaking the coffee crust' },
  ],
  AeroPress: [
    { label: 'AeroPress Brewer & Plunger', detail: 'Standard or inverted setup' },
    { label: 'AeroPress Paper Micro-Filters', detail: '1–2 filters per brew' },
    { label: 'Stirring Paddle & Funnel', detail: 'Included brewer accessories' },
    { label: 'Burr Coffee Grinder', detail: 'Medium-fine uniform grind' },
    { label: 'Digital Gram Scale', detail: '0.1g accuracy for dose & bypass' },
  ],
};

function detectExtraIngredients(recipe: CoffeeRecipe): { label: string; detail: string }[] {
  const combined = `${recipe.drinkName} ${recipe.milkDescription} ${recipe.request.craving} ${recipe.steps
    .map((s) => s.instruction)
    .join(' ')}`.toLowerCase();

  const extras: { label: string; detail: string }[] = [];
  if (combined.includes('ice') || combined.includes('iced') || combined.includes('cold')) {
    extras.push({ label: 'Clear Ice Cubes', detail: 'For flash-chilling or serving over ice' });
  }
  if (combined.includes('honey')) {
    extras.push({ label: 'Raw Wildflower Honey', detail: 'Natural floral sweetener' });
  }
  if (combined.includes('brown sugar') || combined.includes('muscovado')) {
    extras.push({ label: 'Dark Brown Sugar', detail: 'Molasses warmth for syrupy sweetness' });
  }
  if (combined.includes('maple')) {
    extras.push({ label: 'Pure Maple Syrup', detail: 'Grade A amber maple' });
  }
  if (combined.includes('vanilla')) {
    extras.push({ label: 'Pure Vanilla Bean / Extract', detail: 'Just a drop for aromatic lift' });
  }
  if (combined.includes('cinnamon') || combined.includes('cardamom') || combined.includes('nutmeg')) {
    extras.push({ label: 'Warm Baking Spices', detail: 'Freshly ground cinnamon or cardamom' });
  }
  if (combined.includes('citrus') || combined.includes('orange') || combined.includes('lemon')) {
    extras.push({ label: 'Fresh Citrus Peel', detail: 'Orange or lemon zest twist' });
  }
  if (combined.includes('cocoa') || combined.includes('chocolate') || combined.includes('cacao')) {
    extras.push({ label: 'Unsweetened Dutch Cocoa', detail: 'Dusting or bittersweet melt' });
  }
  if (combined.includes('tonic')) {
    extras.push({ label: 'Chilled Tonic Water', detail: 'Botanical sparkling mixer' });
  }
  return extras;
}

export function ShoppingListPanel({
  recipe,
  onClose,
  onCopiedToast,
}: ShoppingListPanelProps) {
  const items = useMemo<GroceryItem[]>(() => {
    const list: GroceryItem[] = [
      {
        id: 'beans-primary',
        category: 'Coffee Beans',
        label: `Whole Specialty Coffee Beans (${recipe.coffeeGrams}g per brew)`,
        detail: `${recipe.originRecommendation} · ${recipe.request.roastLevel} Roast`,
      },
      {
        id: 'water-filtered',
        category: 'Milk & Pantry',
        label: `Filtered Brewing Water (${recipe.waterGrams}g)`,
        detail: `Soft-to-medium mineral water heated to ${recipe.waterTempC}°C / ${recipe.waterTempF}°F`,
      },
    ];

    if (recipe.request.milkAlternative !== 'Black') {
      list.push({
        id: 'milk-alt',
        category: 'Milk & Pantry',
        label: `Barista ${recipe.request.milkAlternative} Milk`,
        detail: recipe.milkDescription,
      });
    }

    const extras = detectExtraIngredients(recipe);
    extras.forEach((extra, idx) => {
      list.push({
        id: `extra-${idx}`,
        category: 'Milk & Pantry',
        label: extra.label,
        detail: extra.detail,
      });
    });

    const equipment = EQUIPMENT_BY_METHOD[recipe.request.brewMethod] ?? [];
    equipment.forEach((eq, idx) => {
      list.push({
        id: `equip-${idx}`,
        category: 'Brewing Equipment',
        label: eq.label,
        detail: eq.detail,
      });
    });

    return list;
  }, [recipe]);

  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  useEffect(() => {
    setCheckedIds([]);
  }, [recipe.id]);

  const toggleItem = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const categories: GroceryItem['category'][] = [
    'Coffee Beans',
    'Milk & Pantry',
    'Brewing Equipment',
  ];

  const handleCopyShoppingList = async () => {
    const lines: string[] = [
      `🛒 Shopping List — ${recipe.drinkName}`,
      `Method: ${recipe.request.brewMethod} · ${recipe.request.roastLevel} Roast`,
      '',
    ];
    for (const category of categories) {
      const catItems = items.filter((i) => i.category === category);
      if (catItems.length === 0) continue;
      lines.push(`${category}:`);
      catItems.forEach((item) => {
        const mark = checkedIds.includes(item.id) ? '[x]' : '[ ]';
        lines.push(`${mark} ${item.label} — ${item.detail}`);
      });
      lines.push('');
    }
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      onCopiedToast('Shopping list copied!');
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <section
      aria-label="Interactive grocery and equipment shopping list"
      className="mt-6 rounded-xl border border-[#1F140E]/15 bg-[#EFE6D8] p-5 sm:p-6 text-[#1F140E]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F140E]/12 pb-4">
        <div>
          <span className="text-xs font-semibold text-[#A45B12]">
            Barista Shopping List
          </span>
          <h4 className="font-display text-xl font-semibold text-[#1F140E]">
            Beans, Milk &amp; Bar Gear
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-medium text-[#6E5849] tabular-nums">
            {checkedIds.length} / {items.length} checked
          </span>
          <button
            type="button"
            onClick={handleCopyShoppingList}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#1F140E]/15 bg-[#FAF5EC] px-3 py-1.5 text-xs font-semibold text-[#1F140E] whitespace-nowrap transition-colors hover:bg-[#FAF5EC]/70 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B]"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            Copy List
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping list"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#1F140E]/15 bg-[#FAF5EC] text-[#4C392D] transition-colors hover:text-[#1F140E] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => {
          const catItems = items.filter((item) => item.category === category);
          if (catItems.length === 0) return null;

          return (
            <div
              key={category}
              className={category === 'Brewing Equipment' ? 'md:col-span-2' : ''}
            >
              <h5 className="text-xs font-semibold tracking-wide text-[#6E5849]">
                {category}
              </h5>
              <ul
                className={`mt-2.5 divide-y divide-[#1F140E]/10 ${
                  category === 'Brewing Equipment'
                    ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y-0'
                    : ''
                }`}
              >
                {catItems.map((item) => {
                  const isChecked = checkedIds.includes(item.id);
                  return (
                    <li
                      key={item.id}
                      className={
                        category === 'Brewing Equipment'
                          ? 'border-b border-[#1F140E]/10 py-2.5'
                          : 'py-2.5'
                      }
                    >
                      <label className="flex items-start gap-3 cursor-pointer select-none group">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={isChecked}
                          onClick={() => toggleItem(item.id)}
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B] ${
                            isChecked
                              ? 'border-[#1F140E] bg-[#1F140E] text-[#FAF5EC]'
                              : 'border-[#1F140E]/30 bg-[#FAF5EC] group-hover:border-[#D9822B]'
                          }`}
                        >
                          {isChecked && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                        </button>
                        <div
                          onClick={() => toggleItem(item.id)}
                          className="min-w-0 flex-1"
                        >
                          <div
                            className={`text-sm font-semibold leading-snug transition-colors ${
                              isChecked
                                ? 'line-through text-[#7A6252]'
                                : 'text-[#1F140E]'
                            }`}
                          >
                            {item.label}
                          </div>
                          <div className="mt-0.5 text-xs text-[#6E5849]">
                            {item.detail}
                          </div>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {checkedIds.length > 0 && (
        <div className="mt-4 flex justify-end border-t border-[#1F140E]/10 pt-3">
          <button
            type="button"
            onClick={() => setCheckedIds([])}
            className="text-xs font-semibold text-[#A45B12] hover:underline cursor-pointer"
          >
            Clear checked items
          </button>
        </div>
      )}
    </section>
  );
}
