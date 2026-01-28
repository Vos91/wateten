"use client";

import { useState } from "react";
import { ProductInput } from "@/components/ProductInput";
import { RecipeCard } from "@/components/RecipeCard";
import { LoadingRecipe } from "@/components/LoadingRecipe";
import type { Recipe } from "@/types";

export default function Home() {
  const [products, setProducts] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecipe = async () => {
    if (products.length === 0) return;
    
    setLoading(true);
    setError(null);
    setRecipe(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });

      if (!response.ok) {
        throw new Error("Er ging iets mis bij het genereren");
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
    setProducts([]);
    setRecipe(null);
    setError(null);
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
          {(products.length > 0 || recipe) && (
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
        {/* Hero - only show when no recipe */}
        {!recipe && !loading && (
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-2">
              Van Jumbo naar recept
            </h2>
            <p className="text-[--text-secondary]">
              Voeg je producten toe en krijg een lekker recept
            </p>
          </div>
        )}

        {/* Product Input */}
        {!recipe && !loading && (
          <div className="animate-fade-in">
            <ProductInput
              products={products}
              onProductsChange={setProducts}
              onGenerate={generateRecipe}
            />
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
        {recipe && <RecipeCard recipe={recipe} />}

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-[--text-secondary]">
          <p>Gemaakt met 🦊 door J-Vos</p>
          <p className="mt-1 text-xs">Max 20 min • 1 persoon • Geen kaas</p>
        </footer>
      </div>
    </main>
  );
}
