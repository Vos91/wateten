"use client";

import { useState } from "react";
import type { Recipe } from "@/types";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (index: number) => {
    const newChecked = new Set(checkedSteps);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedSteps(newChecked);
  };

  const progress = (checkedSteps.size / recipe.steps.length) * 100;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Recipe Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{recipe.title}</h2>
            <p className="text-[--text-secondary] mt-1">{recipe.description}</p>
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span>⏱️</span>
            <span>{recipe.prepTime} min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>👤</span>
            <span>{recipe.servings} persoon</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>📊</span>
            <span>{recipe.difficulty}</span>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">🥘 Ingrediënten</h3>
        <ul className="space-y-2">
          {recipe.ingredients.map((ingredient, index) => (
            <li
              key={index}
              className={`flex items-center justify-between py-2 border-b border-gray-50 last:border-0 ${
                ingredient.fromInput ? "font-medium" : ""
              }`}
            >
              <span className="flex items-center gap-2">
                {ingredient.fromInput && (
                  <span className="w-2 h-2 bg-[#FFE100] rounded-full" />
                )}
                {ingredient.name}
              </span>
              <span className="text-[--text-secondary] text-sm">
                {ingredient.amount}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-[--text-secondary]">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 bg-[#FFE100] rounded-full" />
            = jouw producten
          </span>
        </p>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">👨‍🍳 Bereiding</h3>
          <span className="text-sm text-[--text-secondary]">
            {checkedSteps.size}/{recipe.steps.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-[#FFE100] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <ol className="space-y-4">
          {recipe.steps.map((step, index) => (
            <li
              key={index}
              onClick={() => toggleStep(index)}
              className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                checkedSteps.has(index)
                  ? "bg-green-50 text-green-700"
                  : "hover:bg-gray-50"
              }`}
            >
              <span
                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                  checkedSteps.has(index)
                    ? "bg-green-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                {checkedSteps.has(index) ? "✓" : index + 1}
              </span>
              <span className={checkedSteps.has(index) ? "line-through" : ""}>
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Tips */}
      {recipe.tips && (
        <div className="bg-yellow-50 rounded-3xl p-6">
          <h3 className="text-lg font-semibold mb-2">💡 Tip</h3>
          <p className="text-[--text-secondary]">{recipe.tips}</p>
        </div>
      )}

      {/* Nutrition */}
      {recipe.nutrition && (
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">📊 Voedingswaarde</h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-lg font-bold">{recipe.nutrition.calories}</div>
              <div className="text-xs text-[--text-secondary]">kcal</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-lg font-bold">{recipe.nutrition.protein}g</div>
              <div className="text-xs text-[--text-secondary]">eiwit</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-lg font-bold">{recipe.nutrition.carbs}g</div>
              <div className="text-xs text-[--text-secondary]">koolh</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-lg font-bold">{recipe.nutrition.fat}g</div>
              <div className="text-xs text-[--text-secondary]">vet</div>
            </div>
          </div>
        </div>
      )}

      {/* Completion celebration */}
      {checkedSteps.size === recipe.steps.length && (
        <div className="bg-green-500 text-white rounded-3xl p-6 text-center animate-fade-in">
          <span className="text-4xl mb-2 block">🎉</span>
          <h3 className="text-xl font-bold">Eet smakelijk!</h3>
          <p className="text-green-100 mt-1">Je recept is klaar</p>
        </div>
      )}
    </div>
  );
}
