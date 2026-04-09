import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface DetectionResult {
  label: "Stain" | "Hole" | "Broken yarn" | "Not fabric" | "No defect";
  confidence: number;
  description: string;
}

export async function detectFabricDefect(base64Image: string, mimeType: string): Promise<DetectionResult> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze this image of fabric. 
    Classify it into one of these categories:
    1. Stain: Visible stains or discolorations on the fabric.
    2. Hole: Physical holes or tears in the fabric.
    3. Broken yarn: Loose threads, snags, or broken weave patterns.
    4. No defect: Clean fabric with no visible issues.
    5. Not fabric: If the image is not of a fabric at all.

    Return the result in JSON format:
    {
      "label": "Stain" | "Hole" | "Broken yarn" | "No defect" | "Not fabric",
      "confidence": number (0-1),
      "description": "brief explanation"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64Image.split(",")[1] || base64Image,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      label: result.label || "No defect",
      confidence: result.confidence || 0.5,
      description: result.description || "Analysis complete.",
    };
  } catch (error) {
    console.error("Detection error:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
}
