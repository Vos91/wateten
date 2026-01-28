export interface Recipe {
  title: string;
  description: string;
  prepTime: number; // in minutes
  servings: number;
  difficulty: "Makkelijk" | "Gemiddeld" | "Uitdagend";
  ingredients: Ingredient[];
  steps: string[];
  tips?: string;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface Ingredient {
  name: string;
  amount: string;
  fromInput: boolean; // true if from user's product list
}

export interface GenerateRequest {
  products: string[];
}

export interface GenerateResponse {
  recipe: Recipe;
}
