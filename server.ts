import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const VALID_FLAVORS = new Set(["Sweet", "Bold", "Chocolaty", "Nutty", "Fruity", "Floral"]);
const VALID_ROASTS = new Set(["Light", "Medium", "Dark"]);
const VALID_METHODS = new Set(["Espresso", "Pour-Over V60", "French Press", "AeroPress"]);
const VALID_MILKS = new Set(["Oat", "Almond", "Whole", "Soy", "Black"]);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/craft-recipe", async (req, res) => {
    try {
      const ai = getAiClient();
      if (!ai) {
        return res.status(500).json({
          error:
            "GEMINI_API_KEY is not configured. Please check your API key in the Settings > Secrets panel.",
        });
      }

      const body = req.body ?? {};
      const rawFlavors: unknown[] = Array.isArray(body.flavorNotes) ? body.flavorNotes : [];
      const flavorNotes = rawFlavors
        .filter((f): f is string => typeof f === "string" && VALID_FLAVORS.has(f));
      const selectedFlavors = flavorNotes.length > 0 ? flavorNotes : ["Sweet", "Chocolaty"];

      const roastLevel =
        typeof body.roastLevel === "string" && VALID_ROASTS.has(body.roastLevel)
          ? body.roastLevel
          : "Medium";

      const brewMethod =
        typeof body.brewMethod === "string" && VALID_METHODS.has(body.brewMethod)
          ? body.brewMethod
          : "Pour-Over V60";

      const milkAlternative =
        typeof body.milkAlternative === "string" && VALID_MILKS.has(body.milkAlternative)
          ? body.milkAlternative
          : "Black";

      const craving =
        typeof body.craving === "string" ? body.craving.trim().slice(0, 300) : "";

      const servings = body.servings === 2 ? 2 : 1;

      const systemInstruction = `You are the head specialty coffee roaster and championship barista at "The Backyard Barista", a warm, artisanal neighborhood micro-café.
Your job is to craft an authentic, café-grade custom coffee recipe tailored precisely to the user's flavor notes, roast level, brew method, milk choice, serving count, and optional craving.

Follow strict specialty coffee extraction science:
- Espresso: typical single/double dose 18g–20g per serving (yield 36g–44g liquid espresso, 1:2 to 1:2.3 ratio, fine grind ~200–300 microns, 90–94°C depending on roast, 26–32s extraction). If milk is selected (Oat, Almond, Whole, Soy), include exact steamed or iced milk grams and pouring instructions in the steps and milkDescription.
- Pour-Over V60: typical 15g–18g coffee per serving at 1:15 to 1:16.5 ratio (240g–300g water for 1 cup, double for 2 cups). Medium-fine grind (~500–650 microns, table salt texture). Light roast hotter (94–96°C), Medium (91–93°C), Dark (88–90°C). Include a bloom step (2x–3x coffee weight for 35–45s) and controlled pulse pours with cumulative targetWeightGrams.
- French Press: typical 18g–22g per serving at 1:14 to 1:15 ratio. Coarse grind (~850–1000 microns, sea salt texture). Steep 4:00, gently break crust, plunge slowly.
- AeroPress: typical 15g–18g per serving at 1:13 to 1:15 (or concentrated 1:6 bypass / milk drink base if milk is chosen!). Medium-fine grind (~450–600 microns).
- Scale coffeeGrams and waterGrams accurately for ${servings} serving(s).
- If the user's craving mentions iced, cold, spiced, honey, maple, citrus, tonic, or dessert-like notes, seamlessly weave authentic café preparation (e.g., Japanese flash-brew over ice with exact ice grams subtracted from brew water, orange zest expressed on rim, warm spice bloom in grounds, or cold foam) into the drinkName, milkDescription, and numbered steps while keeping exact gram measurements!
- Every step must have a realistic durationSeconds (e.g. 35 for bloom, 40 for pour, 180 for steep) so the user can follow along with an interactive brew timer.
- Avoid generic filler; write concise, tactile, sensory barista instructions.`;

      const userPrompt = `Craft a custom specialty coffee recipe with these specifications:
- Target Flavor Notes: ${selectedFlavors.join(", ")}
- Roast Level: ${roastLevel}
- Brew Method: ${brewMethod}
- Milk Alternative: ${milkAlternative}
- Servings: ${servings} ${servings === 1 ? "cup" : "cups"}
- Craving / Mood: ${craving || "Balanced, comforting backyard morning brew"}`;

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              drinkName: {
                type: Type.STRING,
                description: "An evocative, authentic specialty café drink name.",
              },
              tagline: {
                type: Type.STRING,
                description: "A concise one-sentence tasting and sensory description.",
              },
              originRecommendation: {
                type: Type.STRING,
                description:
                  "Recommended coffee origin, varietal, or processing method suited to the roast and flavor notes.",
              },
              coffeeGrams: {
                type: Type.NUMBER,
                description: "Exact coffee dose in grams.",
              },
              waterGrams: {
                type: Type.NUMBER,
                description: "Exact total brew water in grams.",
              },
              ratioLabel: {
                type: Type.STRING,
                description: "Exact brew ratio formatted cleanly, e.g. '1 : 16' or '1 : 2.1'.",
              },
              milkDescription: {
                type: Type.STRING,
                description:
                  "Exact milk preparation in grams and temperature, or 'Served black — no milk added'.",
              },
              grindSize: {
                type: Type.STRING,
                description:
                  "Specific grind setting with tactile texture comparison (e.g. 'Medium-Fine · fine sea salt').",
              },
              waterTempC: {
                type: Type.INTEGER,
                description: "Water temperature in Celsius.",
              },
              waterTempF: {
                type: Type.INTEGER,
                description: "Water temperature in Fahrenheit.",
              },
              totalBrewTime: {
                type: Type.STRING,
                description: "Total brew time formatted like '2:45' or '4:15'.",
              },
              totalYield: {
                type: Type.STRING,
                description: "Final beverage yield, e.g. '260ml cup' or '340ml iced glass'.",
              },
              steps: {
                type: Type.ARRAY,
                description: "4 to 6 chronological, numbered brewing steps.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: {
                      type: Type.INTEGER,
                      description: "1-indexed step number.",
                    },
                    title: {
                      type: Type.STRING,
                      description: "Short 2-4 word step title, e.g. 'Bloom the Grounds'.",
                    },
                    instruction: {
                      type: Type.STRING,
                      description: "Clear, tactile barista instruction with gram weights and pour technique.",
                    },
                    durationSeconds: {
                      type: Type.INTEGER,
                      description: "Estimated duration of this step in seconds (minimum 10).",
                    },
                    targetWeightGrams: {
                      type: Type.INTEGER,
                      description: "Optional cumulative scale weight in grams at the end of this step.",
                    },
                  },
                  required: ["stepNumber", "title", "instruction", "durationSeconds"],
                },
              },
              baristaTip: {
                type: Type.STRING,
                description: "One focused pro tip to elevate sweetness, body, or milk texture.",
              },
            },
            required: [
              "drinkName",
              "tagline",
              "originRecommendation",
              "coffeeGrams",
              "waterGrams",
              "ratioLabel",
              "milkDescription",
              "grindSize",
              "waterTempC",
              "waterTempF",
              "totalBrewTime",
              "totalYield",
              "steps",
              "baristaTip",
            ],
          },
        },
      });

      const rawText = (response.text ?? "").trim();
      if (!rawText) {
        return res.status(502).json({
          error: "Our barista returned an empty recipe. Please try crafting again.",
        });
      }

      const parsed = JSON.parse(rawText);
      const recipe = {
        id: `brew_${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...parsed,
        request: {
          flavorNotes: selectedFlavors,
          roastLevel,
          brewMethod,
          milkAlternative,
          craving,
          servings,
        },
      };

      return res.json({ recipe });
    } catch (err: unknown) {
      console.error("Error crafting coffee recipe:", err);
      const message =
        err instanceof Error ? err.message : "Unexpected error generating coffee recipe.";
      return res.status(500).json({
        error: message.includes("API_KEY") || message.includes("403") || message.includes("401")
          ? "Unable to authenticate with Gemini API. Please verify your API key in Settings > Secrets."
          : `Failed to craft recipe: ${message}`,
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The Backyard Barista server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
