// src/geminiTest.ts
import * as dotenv from "dotenv";

dotenv.config(); // carga .env → GEMINI_API_KEY

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY no está definida en .env");
}

(async () => {
  try {
    const { GoogleGenAI } = await import("@google/genai");
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await genAI.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [{ role: "user", parts: [{ text: "Hola, ¿puedes saludarme?" }] }],
    });
    console.log("Respuesta de Gemini:");
    console.log(JSON.stringify(response, null, 2));
  } catch (err) {
    console.error("Error al llamar a Gemini:", err);
  }
})();
