
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBackendAdvice = async (topic: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a senior Python backend developer mentoring a student. 
      The student is building a professional messenger (like Telegram/WhatsApp).
      Topic: ${topic}.
      Context: Flask backend, SQLite, real-time communication.
      
      Requirements:
      1. Explain in Russian.
      2. If real-time, focus on Flask-SocketIO.
      3. Provide concise Python code snippets.
      4. Explain database relationships for messages (One-to-Many).
      5. Keep it under 300 words.`,
    });
    return response.text || "Не удалось получить ответ от ИИ.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Произошла ошибка при обращении к ИИ-помощнику.";
  }
};
