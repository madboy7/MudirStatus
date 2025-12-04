import { GoogleGenAI } from "@google/genai";
import { OfficeStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Returns the hardcoded default Arabic message for a status.
 */
export const getDefaultMessage = (status: OfficeStatus): string => {
  switch (status) {
    case OfficeStatus.AVAILABLE:
      return "المكتب مفتوح، تفضل بالدخول.";
    case OfficeStatus.BUSY:
      return "مشغول حالياً، الرجاء عدم الإزعاج.";
    case OfficeStatus.CLOSED:
      return "الدوام انتهى، نراكم غداً.";
    case OfficeStatus.PRAYER:
      return "ذهب للصلاة وسيعود قريباً.";
    default:
      return "";
  }
};

/**
 * Generates a polite and professional status message based on the status and optional context.
 */
export const generateStatusMessage = async (
  status: OfficeStatus,
  context: string = ""
): Promise<string> => {
  try {
    const modelId = "gemini-2.5-flash"; // Using Flash for speed

    let prompt = "";

    if (status === OfficeStatus.AVAILABLE) {
      prompt = `
        You are an assistant for a manager. 
        Write a short, welcoming phrase in Arabic stating the manager is available.
        Context: "${context}"
        Constraints: Output MUST be in Arabic only. No English. Keep it under 10 words. Professional and warm.
      `;
    } else if (status === OfficeStatus.BUSY) {
      prompt = `
        You are an assistant for a manager.
        Write a polite phrase in Arabic stating the manager is busy and cannot be disturbed right now.
        Reason/Context: "${context}"
        Constraints: Output MUST be in Arabic only. No English. Keep it under 15 words. Professional, apologetic but firm.
      `;
    } else if (status === OfficeStatus.PRAYER) {
      prompt = `
        You are an assistant for a manager.
        Write a short, polite phrase in Arabic stating the manager is at prayer and will return soon.
        Context: "${context}"
        Constraints: Output MUST be in Arabic only. No English. Keep it under 10 words. Respectful and calm tone.
      `;
    } else {
      prompt = `
        You are an assistant for a manager.
        Write a short phrase in Arabic stating the office is closed.
        Context: "${context}"
        Constraints: Output MUST be in Arabic only. No English. Keep it under 10 words.
      `;
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text?.trim() || getDefaultMessage(status);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return getDefaultMessage(status);
  }
};