import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// We use the new @google/genai SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are a professional Valorant coach.
Your goal is to help players improve their gameplay and rank up.

Rules:
- Give specific, actionable advice
- Use Valorant terminology (angles, crosshair placement, entry frag, etc.)
- Structure answers clearly (tips, steps, mistakes)
- Adapt to player's rank if mentioned
- Keep answers concise but useful
- DO NOT use any Markdown formatting like **bold** or *italics*. Use plain, unformatted text only.

Avoid:
- Generic advice
- Talking about unrelated topics or other games
- General life advice`;

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { message: "API key is missing! Please configure GEMINI_API_KEY." },
        { status: 500 }
      );
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { message: "Invalid message payload." },
        { status: 400 }
      );
    }

    // Convert chat history for Gemini API payload
    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // Perform non-streaming generation 
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: {
          role: "system",
          parts: [{ text: SYSTEM_PROMPT }]
        },
        temperature: 0.7,
      }
    });

    return NextResponse.json({ message: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { message: "Coach lost connection. Try again." },
      { status: 500 }
    );
  }
}
