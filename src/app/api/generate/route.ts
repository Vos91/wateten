import { NextRequest, NextResponse } from "next/server";
import type { Recipe } from "@/types";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

// Rate limit config: 10 requests per minute per IP
const RATE_LIMIT_CONFIG = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
};

const VIBE_DESCRIPTIONS: Record<string, string> = {
  quick: "Het recept moet HEEL snel klaar zijn, maximaal 10-15 minuten.",
  healthy: "Focus op gezonde, lichte ingrediënten. Veel groenten, weinig vet.",
  comfort: "Comfort food - hartverwarmend, rijk, troostend. Denk aan pasta, stamppot, curry.",
  spicy: "Pittig! Gebruik chilipepers, sriracha, of andere kruiden voor hitte.",
  world: "Internationale keuken - Aziatisch, Mexicaans, Mediterraans, etc. Verrassend en anders.",
  budget: "Goedkope ingrediënten die iedereen in huis heeft of goedkoop bij de Jumbo kan halen.",
};

const SYSTEM_PROMPT = `Je bent een creatieve chef die diner suggesties geeft.

BELANGRIJKE REGELS:
- Recepten moeten ALTIJD binnen 20 minuten te bereiden zijn
- Recepten zijn ALTIJD voor 1 persoon
- NOOIT kaas gebruiken (geen enkele soort kaas, ook geen Parmezaan!)
- Geef concrete, praktische recepten
- Ingrediënten moeten makkelijk verkrijgbaar zijn bij de Jumbo
- Wees creatief maar realistisch
- Varieer in je suggesties - niet altijd pasta of rijst

Geef je antwoord ALLEEN als JSON in dit formaat:
{
  "title": "Naam van het gerecht",
  "description": "Korte, appetijt opwekkende beschrijving (1-2 zinnen)",
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

const MOCK_RECIPES: Recipe[] = [
  {
    title: "Teriyaki Zalm met Peultjes",
    description: "Glazuurde zalm met knapperige groenten en een sticky-sweet saus.",
    prepTime: 18,
    servings: 1,
    difficulty: "Makkelijk",
    ingredients: [
      { name: "Zalmfilet", amount: "150g", fromInput: true },
      { name: "Peultjes", amount: "100g", fromInput: true },
      { name: "Sojasaus", amount: "2 el", fromInput: false },
      { name: "Honing", amount: "1 el", fromInput: false },
      { name: "Knoflook", amount: "1 teen", fromInput: false },
      { name: "Rijst", amount: "75g", fromInput: false },
    ],
    steps: [
      "Kook de rijst volgens de verpakking.",
      "Meng sojasaus, honing en geperste knoflook voor de teriyaki saus.",
      "Bak de zalm 3 minuten per kant in een hete pan.",
      "Voeg de peultjes toe en bak 2 minuten mee.",
      "Giet de saus erover en laat 1 minuut karamelliseren.",
      "Serveer op de rijst.",
    ],
    tips: "Voeg wat sesamzaadjes toe voor extra crunch!",
    nutrition: { calories: 520, protein: 38, carbs: 45, fat: 18 },
  },
  {
    title: "Snelle Shakshuka",
    description: "Gepocheerde eieren in een kruidige tomatensaus. Noord-Afrikaanse classic.",
    prepTime: 15,
    servings: 1,
    difficulty: "Makkelijk",
    ingredients: [
      { name: "Eieren", amount: "2 stuks", fromInput: true },
      { name: "Gepelde tomaten (blik)", amount: "200g", fromInput: true },
      { name: "Ui", amount: "½", fromInput: false },
      { name: "Paprikapoeder", amount: "1 tl", fromInput: false },
      { name: "Komijn", amount: "½ tl", fromInput: false },
      { name: "Brood", amount: "2 sneetjes", fromInput: false },
    ],
    steps: [
      "Fruit de gesnipperde ui in olijfolie.",
      "Voeg paprikapoeder en komijn toe, bak 30 seconden.",
      "Giet de tomaten erbij en laat 5 minuten pruttelen.",
      "Maak 2 kuiltjes en breek de eieren erin.",
      "Deksel erop, 5 minuten op laag vuur tot de eieren gestold zijn.",
      "Serveer met brood om te dippen.",
    ],
    tips: "Lekker met verse koriander of peterselie!",
    nutrition: { calories: 380, protein: 18, carbs: 35, fat: 16 },
  },
  {
    title: "Kip Pesto Pasta",
    description: "Romige pasta met malse kip en verse pesto. Italiaanse comfort in 15 minuten.",
    prepTime: 15,
    servings: 1,
    difficulty: "Makkelijk",
    ingredients: [
      { name: "Pasta (penne)", amount: "100g", fromInput: true },
      { name: "Kipfilet", amount: "120g", fromInput: true },
      { name: "Groene pesto", amount: "2 el", fromInput: true },
      { name: "Cherrytomaten", amount: "6 stuks", fromInput: false },
      { name: "Slagroom", amount: "50ml", fromInput: false },
      { name: "Pijnboompitten", amount: "1 el", fromInput: false },
    ],
    steps: [
      "Kook de pasta volgens de verpakking.",
      "Snijd de kip in blokjes en bak goudbruin.",
      "Halveer de tomaatjes en voeg toe aan de kip.",
      "Roer de pesto en slagroom erdoor.",
      "Meng met de afegoten pasta.",
      "Top met pijnboompitten.",
    ],
    tips: "Gebruik verse pesto voor de beste smaak.",
    nutrition: { calories: 650, protein: 42, carbs: 55, fat: 28 },
  },
  {
    title: "Aziatische Roerbak",
    description: "Knapperige groenten met een umami-rijke saus. Klaar in 10 minuten!",
    prepTime: 10,
    servings: 1,
    difficulty: "Makkelijk",
    ingredients: [
      { name: "Wokgroenten (mix)", amount: "200g", fromInput: true },
      { name: "Tofublokjes", amount: "100g", fromInput: true },
      { name: "Sojasaus", amount: "2 el", fromInput: false },
      { name: "Sesamolie", amount: "1 tl", fromInput: false },
      { name: "Gember (vers)", amount: "1 cm", fromInput: false },
      { name: "Noedels", amount: "1 nest", fromInput: false },
    ],
    steps: [
      "Kook de noedels volgens de verpakking.",
      "Verhit een wok of grote pan op hoog vuur.",
      "Bak de tofu knapperig, zet apart.",
      "Roerbak de groenten 2-3 minuten.",
      "Voeg geraspte gember, sojasaus en sesamolie toe.",
      "Meng met noedels en tofu. Serveer direct!",
    ],
    tips: "Lekker met wat sriracha voor extra pit!",
    nutrition: { calories: 420, protein: 22, carbs: 48, fat: 14 },
  },
];

function getMockRecipe(): Recipe {
  return MOCK_RECIPES[Math.floor(Math.random() * MOCK_RECIPES.length)];
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(clientIP, RATE_LIMIT_CONFIG);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: `Te veel verzoeken. Probeer het over ${rateLimitResult.resetIn} seconden opnieuw.`,
          retryAfter: rateLimitResult.resetIn 
        },
        { 
          status: 429,
          headers: {
            "Retry-After": rateLimitResult.resetIn.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.resetIn.toString(),
          }
        }
      );
    }

    const body = await request.json();
    const { vibes = [] } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // If no API key, return mock recipe
    if (!apiKey) {
      console.log("No API key, using mock recipe");
      // Simulate loading time
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return NextResponse.json({ recipe: getMockRecipe() });
    }

    // Build prompt based on vibes
    let vibeInstructions = "";
    if (vibes.length > 0) {
      vibeInstructions = "\n\nDe gebruiker wil specifiek:\n";
      vibes.forEach((vibe: string) => {
        if (VIBE_DESCRIPTIONS[vibe]) {
          vibeInstructions += `- ${VIBE_DESCRIPTIONS[vibe]}\n`;
        }
      });
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
            content: `Geef me een diner suggestie voor vanavond.${vibeInstructions}\n\nWees creatief en verrassend! Niet de standaard pasta bolognese ofzo.`,
          },
        ],
        system: SYSTEM_PROMPT,
      }),
    });

    if (!response.ok) {
      console.error("Claude API error:", await response.text());
      return NextResponse.json({ recipe: getMockRecipe() });
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response");
      return NextResponse.json({ recipe: getMockRecipe() });
    }

    const recipe: Recipe = JSON.parse(jsonMatch[0]);
    return NextResponse.json(
      { recipe },
      {
        headers: {
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        }
      }
    );
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Er ging iets mis bij het genereren" },
      { status: 500 }
    );
  }
}
