
import { GoogleGenAI } from "@google/genai";

// Always initialize the client with a named parameter using process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStudentSummary = async (studentName: string, notes: string[]) => {
  try {
    // Basic summary task uses gemini-3-flash-preview.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on these tutoring notes for ${studentName}, please provide a short, professional progress summary and suggest one area for improvement. Notes: ${notes.join('; ')}`,
      config: {
        systemInstruction: "You are an expert pedagogical assistant helping a private tutor track student progress.",
        temperature: 0.7,
      }
    });
    // Use the .text property directly to access the response content.
    return response.text || "No summary generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating summary.";
  }
};
