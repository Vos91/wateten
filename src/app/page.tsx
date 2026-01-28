"use client";

import { useState } from "react";
import { RecipeCard } from "@/components/RecipeCard";
import { LoadingRecipe } from "@/components/LoadingRecipe";
import type { Recipe } from "@/types";

const VIBES = [
  { id: "quick", emoji: "⚡", label: "Snel", desc: "< 15 min" },
  { id: "healthy", emoji: "🥗", label: "Gezond", desc: "Light & fresh" },
  { id: "comfort", emoji: "🍝", label: "Comfort", desc: "Feel good food" },
  { id: "spicy", emoji: "🌶️", label: "Pittig", desc: "Met een kick" },
  { id: "world", emoji: "🌍", label: "Wereld", desc: "Internationale keuken" },
  { id: "budget", emoji: "💰", label: "Budget", desc: "Goedkoop & lekker" },
];

export default function Home() {
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleVibe = (id: string) => {
    setSelectedVibes((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const generateRecipe = async () => {
    setLoading(true);
    setError(null);
    setRecipe(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibes: selectedVibes }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error(errorData.error || "Te veel verzoeken. Wacht even en probeer opnieuw.");
        }
        throw new Error(errorData.error || "Er ging iets mis bij het genereren");
      }

      const data = await response.json();
      setRecipe(data.recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setRecipe(null);
    setError(null);
  };

  const newRecipe = () => {
    setRecipe(null);
    generateRecipe();
  };

  return (
    <main className="min-h-screen pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FFE100] shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍳</span>
            <h1 className="text-xl font-bold text-black">Wat Eten We?</h1>
          </div>
          {recipe && (
            <button
              onClick={reset}
              className="text-sm font-medium text-black/70 hover:text-black transition-colors"
            >
              Opnieuw
            </button>
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Main Content - only show when no recipe */}
        {!recipe && !loading && (
          <div className="animate-fade-in">
            {/* Hero */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">
                Geen zin om na te denken?
              </h2>
              <p className="text-[--text-secondary] text-lg">
                Wij kiezen wel voor je.
              </p>
            </div>

            {/* Vibe Selection */}
            <div className="mb-8">
              <p className="text-sm text-[--text-secondary] font-medium mb-3">
                Optioneel: waar heb je zin in?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {VIBES.map((vibe) => (
                  <button
                    key={vibe.id}
                    onClick={() => toggleVibe(vibe.id)}
                    className={`p-4 rounded-2xl text-left transition-all ${
                      selectedVibes.includes(vibe.id)
                        ? "bg-[#FFE100] shadow-md scale-[1.02]"
                        : "bg-white hover:bg-gray-50 border border-gray-100"
                    }`}
                  >
                    <span className="text-2xl">{vibe.emoji}</span>
                    <div className="mt-2">
                      <div className="font-semibold">{vibe.label}</div>
                      <div className="text-xs text-[--text-secondary]">
                        {vibe.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateRecipe}
              className="w-full py-5 bg-black text-white font-semibold text-xl rounded-2xl hover:bg-gray-800 active:scale-[0.98] transition-all shadow-lg shadow-black/10"
            >
              ✨ Verras me!
            </button>

            {selectedVibes.length > 0 && (
              <button
                onClick={() => setSelectedVibes([])}
                className="w-full mt-3 py-2 text-[--text-secondary] text-sm"
              >
                Filters wissen
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingRecipe />}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 animate-fade-in">
            <p className="text-red-700 text-center">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-3 w-full py-2 text-red-600 font-medium"
            >
              Probeer opnieuw
            </button>
          </div>
        )}

        {/* Recipe Result */}
        {recipe && (
          <>
            <RecipeCard recipe={recipe} />
            <button
              onClick={newRecipe}
              className="w-full mt-6 py-4 bg-black text-white font-semibold text-lg rounded-2xl hover:bg-gray-800 active:scale-[0.98] transition-all"
            >
              🔄 Ander recept
            </button>
          </>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-[--text-secondary]">
          <p>Max 20 min • 1 persoon • Kaasvrij</p>
        </footer>
      </div>
    </main>
  );
}
