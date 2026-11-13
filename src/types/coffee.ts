export type FlavorNote = 'Sweet' | 'Bold' | 'Chocolaty' | 'Nutty' | 'Fruity' | 'Floral';

export type RoastLevel = 'Light' | 'Medium' | 'Dark';

export type BrewMethod = 'Espresso' | 'Pour-Over V60' | 'French Press' | 'AeroPress';

export type MilkAlternative = 'Oat' | 'Almond' | 'Whole' | 'Soy' | 'Black';

export interface CraftRecipeRequest {
  flavorNotes: FlavorNote[];
  roastLevel: RoastLevel;
  brewMethod: BrewMethod;
  milkAlternative: MilkAlternative;
  craving: string;
  servings: 1 | 2;
}

export interface BrewStep {
  stepNumber: number;
  title: string;
  instruction: string;
  durationSeconds: number;
  targetWeightGrams?: number;
}

export interface CoffeeRecipe {
  id: string;
  createdAt: string;
  drinkName: string;
  tagline: string;
  originRecommendation: string;
  coffeeGrams: number;
  waterGrams: number;
  ratioLabel: string;
  milkDescription: string;
  grindSize: string;
  waterTempC: number;
  waterTempF: number;
  totalBrewTime: string;
  totalYield: string;
  steps: BrewStep[];
  baristaTip: string;
  request: CraftRecipeRequest;
}
