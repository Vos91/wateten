"use client";

import { useState, KeyboardEvent } from "react";

interface ProductInputProps {
  products: string[];
  onProductsChange: (products: string[]) => void;
  onGenerate: () => void;
}

const SUGGESTIONS = [
  "Kipfilet",
  "Pasta",
  "Rijst",
  "Broccoli",
  "Paprika",
  "Ui",
  "Knoflook",
  "Tomaten",
  "Gehakt",
  "Zalm",
  "Aardappelen",
  "Eieren",
];

export function ProductInput({ products, onProductsChange, onGenerate }: ProductInputProps) {
  const [input, setInput] = useState("");

  const addProduct = (product: string) => {
    const trimmed = product.trim();
    if (trimmed && !products.includes(trimmed)) {
      onProductsChange([...products, trimmed]);
    }
    setInput("");
  };

  const removeProduct = (index: number) => {
    onProductsChange(products.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      addProduct(input);
    }
  };

  const availableSuggestions = SUGGESTIONS.filter(
    (s) => !products.includes(s)
  ).slice(0, 6);

  return (
    <div className="space-y-4">
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Voeg product toe..."
          className="w-full px-4 py-4 text-lg bg-white rounded-2xl border-2 border-gray-100 focus:border-[#FFE100] focus:outline-none transition-colors"
        />
        {input.trim() && (
          <button
            onClick={() => addProduct(input)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#FFE100] text-black font-medium px-4 py-2 rounded-xl hover:bg-yellow-400 transition-colors"
          >
            Toevoegen
          </button>
        )}
      </div>

      {/* Quick Suggestions */}
      {products.length === 0 && (
        <div className="space-y-2">
          <p className="text-sm text-[--text-secondary] font-medium">
            💡 Populaire producten
          </p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => addProduct(suggestion)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm hover:border-[#FFE100] hover:bg-yellow-50 transition-colors"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Added Products */}
      {products.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-[--text-secondary] font-medium">
            🛒 Jouw producten ({products.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {products.map((product, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FFE100] rounded-full text-sm font-medium"
              >
                {product}
                <button
                  onClick={() => removeProduct(index)}
                  className="ml-1 w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
                  aria-label={`Verwijder ${product}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* More suggestions */}
          {availableSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {availableSuggestions.slice(0, 4).map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => addProduct(suggestion)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-600 hover:border-[#FFE100] hover:bg-yellow-50 transition-colors"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Generate Button */}
      {products.length >= 2 && (
        <button
          onClick={onGenerate}
          className="w-full py-4 bg-black text-white font-semibold text-lg rounded-2xl hover:bg-gray-800 active:scale-[0.98] transition-all shadow-lg shadow-black/10"
        >
          ✨ Genereer Recept
        </button>
      )}

      {products.length === 1 && (
        <p className="text-center text-sm text-[--text-secondary]">
          Voeg nog minimaal 1 product toe
        </p>
      )}
    </div>
  );
}
