import {
  BrewMethod,
  CoffeeRecipe,
  FlavorNote,
  MilkAlternative,
  RoastLevel,
} from '../types/coffee';

export const FLAVOR_NOTES: { label: FlavorNote; hint: string }[] = [
  { label: 'Sweet', hint: 'Brown sugar, honey, caramel' },
  { label: 'Bold', hint: 'Syrupy body, deep intensity' },
  { label: 'Chocolaty', hint: 'Dark cocoa, ganache, cacao nib' },
  { label: 'Nutty', hint: 'Toasted hazelnut, almond praline' },
  { label: 'Fruity', hint: 'Stone fruit, berry, bright citrus' },
  { label: 'Floral', hint: 'Jasmine, bergamot, orange blossom' },
];

export const ROAST_LEVELS: { label: RoastLevel; note: string }[] = [
  { label: 'Light', note: 'Bright & origin-forward' },
  { label: 'Medium', note: 'Balanced & caramelized' },
  { label: 'Dark', note: 'Rich & bittersweet' },
];

export const BREW_METHODS: { label: BrewMethod; detail: string }[] = [
  { label: 'Espresso', detail: '9-bar pressurized extraction' },
  { label: 'Pour-Over V60', detail: 'Clean, layered clarity' },
  { label: 'French Press', detail: 'Full-bodied immersion' },
  { label: 'AeroPress', detail: 'Crisp & versatile pressure' },
];

export const MILK_ALTERNATIVES: MilkAlternative[] = [
  'Oat',
  'Almond',
  'Whole',
  'Soy',
  'Black',
];

export const CRAVING_INSPIRATIONS: string[] = [
  'Velvety morning ritual with toasted hazelnut warmth',
  'Iced afternoon pick-me-up with a hint of citrus & honey',
  'Cozy spiced chocolate cafe latte without syrup',
  'Crisp black single-origin pour-over that highlights berry sweetness',
];

export const SIGNATURE_RECIPE: CoffeeRecipe = {
  id: 'signature-backyard-v60',
  createdAt: '2026-11-13T08:00:00.000Z',
  drinkName: 'Amber Honey Patio Pour-Over',
  tagline:
    'Silky caramel sweetness balanced by toasted almond warmth and a lingering oat-cream finish.',
  originRecommendation: 'Washed Huehuetenango Guatemala or Sul de Minas Brazil',
  coffeeGrams: 18,
  waterGrams: 288,
  ratioLabel: '1 : 16',
  milkDescription: '45g gently warmed Oat milk (58°C), swirled in after drawdown',
  grindSize: 'Medium-Fine · fine sea salt texture (~550 µm)',
  waterTempC: 92,
  waterTempF: 198,
  totalBrewTime: '2:45',
  totalYield: '300ml ceramic mug',
  steps: [
    {
      stepNumber: 1,
      title: 'Rinse & Preheat',
      instruction:
        'Fold the V60 paper seam, place in the dripper, and rinse thoroughly with hot water to eliminate papery taste and warm your carafe.',
      durationSeconds: 15,
    },
    {
      stepNumber: 2,
      title: 'Aromatic Bloom',
      instruction:
        'Add 18g medium-fine grounds, level the bed, and pour 45g of 92°C water in concentric circles. Gently swirl to saturate every particle.',
      durationSeconds: 40,
      targetWeightGrams: 45,
    },
    {
      stepNumber: 3,
      title: 'First Spiral Pour',
      instruction:
        'Pour steadily from the center outward in slow spirals up to 170g total weight, keeping the water level even without hitting the paper walls.',
      durationSeconds: 35,
      targetWeightGrams: 170,
    },
    {
      stepNumber: 4,
      title: 'Final Sweetening Pour',
      instruction:
        'At 1:30, pour the remaining water gently to reach 288g. Give the dripper one light Rao spin so the coffee bed settles flat during drawdown.',
      durationSeconds: 45,
      targetWeightGrams: 288,
    },
    {
      stepNumber: 5,
      title: 'Finish with Oat Milk',
      instruction:
        'Once drawdown finishes around 2:45, decant into a warmed mug and fold in 45g gently steamed oat milk for a velvety honeyed mouthfeel.',
      durationSeconds: 30,
    },
  ],
  baristaTip:
    'Keep the oat milk below 60°C when warming—overheating breaks down natural oat starches and mutes the coffee’s nutty sweetness.',
  request: {
    flavorNotes: ['Sweet', 'Nutty'],
    roastLevel: 'Medium',
    brewMethod: 'Pour-Over V60',
    milkAlternative: 'Oat',
    craving: 'Warm, silky morning patio brew',
    servings: 1,
  },
};

export const EXTRACTION_REFERENCE = [
  {
    method: 'Espresso',
    ratio: '1 : 2.0',
    doseWater: '18g : 36g',
    grind: 'Fine (powdered sugar)',
    temp: '92°C / 198°F',
    time: '0:28',
  },
  {
    method: 'Pour-Over V60',
    ratio: '1 : 16.0',
    doseWater: '18g : 288g',
    grind: 'Medium-Fine (table salt)',
    temp: '93°C / 199°F',
    time: '2:45',
  },
  {
    method: 'French Press',
    ratio: '1 : 14.5',
    doseWater: '20g : 290g',
    grind: 'Coarse (sea salt)',
    temp: '94°C / 201°F',
    time: '4:00',
  },
  {
    method: 'AeroPress',
    ratio: '1 : 14.0',
    doseWater: '16g : 224g',
    grind: 'Medium-Fine (fine sand)',
    temp: '91°C / 196°F',
    time: '2:00',
  },
];
