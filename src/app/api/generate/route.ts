import { NextRequest, NextResponse } from "next/server";
import type { Recipe, GenerateRequest } from "@/types";

const SYSTEM_PROMPT = `Je bent een behulpzame kookassistent die recepten maakt op basis van ingrediënten.

BELANGRIJKE REGELS:
- Recepten moeten ALTIJD binnen 20 minuten te bereiden zijn
- Recepten zijn ALTIJD voor 1 persoon
- NOOIT kaas gebruiken (geen enkele soort kaas!)
- Geef Nederlandse recepten of internationale gerechten met Nederlandse instructies
- Wees creatief maar realistisch
- Gebruik vooral de gegeven ingrediënten, voeg alleen basisprodukten toe indien nodig

Geef je antwoord ALLEEN als JSON in dit formaat:
{
  "title": "Naam van het gerecht",
  "description": "Korte beschrijving (1-2 zinnen)",
  "prepTime": 15,
  "servings": 1,
  "difficulty": "Makkelijk",
  "ingredients": [
    { "name": "Kipfilet", "amount": "150g", "fromInput": true },
    { "name": "Olijfolie", "amount": "1 el", "fromInput": false }
  ],
  "steps": [
    "Stap 1...",
    "Stap 2...",
    "Stap 3..."
  ],
  "tips": "Optionele tip voor het gerecht",
  "nutrition": {
    "calories": 450,
    "protein": 35,
    "carbs": 40,
    "fat": 15
  }
}`;

// Mock recipe for demo/testing
function getMockRecipe(products: string[]): Recipe {
  return {
    title: "Snelle " + products[0] + " met " + (products[1] || "groenten"),
    description: "Een heerlijk en snel gerecht dat binnen 15 minuten op tafel staat.",
    prepTime: 15,
    servings: 1,
    difficulty: "Makkelijk",
    ingredients: [
      ...products.map((p) => ({ name: p, amount: "naar smaak", fromInput: true })),
      { name: "Olijfolie", amount: "1 el", fromInput: false },
      { name: "Zout en peper", amount: "naar smaak", fromInput: false },
    ],
    steps: [
      "Bereid alle ingrediënten voor: was en snijd waar nodig.",
      `Verhit de olijfolie in een pan op middelhoog vuur.`,
      `Voeg ${products[0]} toe en bak 3-4 minuten.`,
      products[1] ? `Voeg ${products[1]} toe en roerbak nog 2 minuten.` : "Roerbak nog 2 minuten.",
      "Breng op smaak met zout en peper.",
      "Serveer direct en eet smakelijk!",
    ],
    tips: "Je kunt dit gerecht nog lekkerder maken met een scheutje sojasaus of citroensap.",
    nutrition: {
      calories: 380,
      protein: 28,
      carbs: 25,
      fat: 18,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { products } = body;

    if (!products || products.length < 2) {
      return NextResponse.json(
        { error: "Minimaal 2 producten nodig" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // If no API key, return mock recipe
    if (!apiKey) {
      console.log("No API key, using mock recipe");
      return NextResponse.json({ recipe: getMockRecipe(products) });
    }

    // Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: `Maak een recept met deze ingrediënten: ${products.join(", ")}`,
          },
        ],
        system: SYSTEM_PROMPT,
      }),
    });

    if (!response.ok) {
      console.error("Claude API error:", await response.text());
      // Fallback to mock on error
      return NextResponse.json({ recipe: getMockRecipe(products) });
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response");
      return NextResponse.json({ recipe: getMockRecipe(products) });
    }

    const recipe: Recipe = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ recipe });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Er ging iets mis bij het genereren" },
      { status: 500 }
    );
  }
}
