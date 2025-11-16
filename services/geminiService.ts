import { GoogleGenAI, Modality } from "@google/genai";

// Ensure the API key is available from environment variables
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
  
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getMimeTypeFromBase64 = (base64String: string): string => {
    const match = base64String.match(/^data:(image\/[a-z]+);base64,/);
    if (match && match[1]) {
        return match[1];
    }
    // Default to jpeg if mime type is not found
    return 'image/jpeg';
}

const cleanBase64 = (base64String: string): string => {
    return base64String.replace(/^data:image\/[a-z]+;base64,/, '');
}

export const editImageWithPrompt = async (
  base64ImageData: string,
  prompt: string
): Promise<string> => {
  try {
    const mimeType = getMimeTypeFromBase64(base64ImageData);
    const cleanedData = cleanBase64(base64ImageData);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: cleanedData,
                        mimeType: mimeType,
                    },
                },
                {
                    text: prompt,
                },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    
    // Extract the image data from the response
    const firstCandidate = response.candidates?.[0];
    if (firstCandidate?.content?.parts) {
        for (const part of firstCandidate.content.parts) {
            if (part.inlineData) {
                const base64ImageBytes = part.inlineData.data;
                const imageMimeType = part.inlineData.mimeType;
                return `data:${imageMimeType};base64,${base64ImageBytes}`;
            }
        }
    }
    
    throw new Error('No image data found in the API response.');

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while processing the image.");
  }
};
