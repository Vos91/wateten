"use client";

const LOADING_MESSAGES = [
  "🍳 Recept bedenken...",
  "🥘 Ingrediënten combineren...",
  "👨‍🍳 Bereidingsstappen schrijven...",
  "✨ Bijna klaar...",
];

import { useState, useEffect } from "react";

export function LoadingRecipe() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Loading Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-8 h-8 border-3 border-[#FFE100] border-t-transparent rounded-full animate-spin" />
          <span className="text-lg font-medium animate-pulse-subtle">
            {LOADING_MESSAGES[messageIndex]}
          </span>
        </div>

        {/* Skeleton content */}
        <div className="space-y-3">
          <div className="skeleton h-8 w-3/4 rounded-lg" />
          <div className="skeleton h-4 w-full rounded-lg" />
          <div className="skeleton h-4 w-2/3 rounded-lg" />
        </div>

        <div className="flex gap-4 mt-6">
          <div className="skeleton h-6 w-20 rounded-full" />
          <div className="skeleton h-6 w-20 rounded-full" />
          <div className="skeleton h-6 w-24 rounded-full" />
        </div>
      </div>

      {/* Skeleton ingredients */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="skeleton h-6 w-32 rounded-lg mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="skeleton h-4 w-24 rounded-lg" />
              <div className="skeleton h-4 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Skeleton steps */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="skeleton h-6 w-28 rounded-lg mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="skeleton w-7 h-7 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-full rounded-lg" />
                <div className="skeleton h-4 w-4/5 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
