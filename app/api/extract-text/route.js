import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

// Initialize the client with the API key from your environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// This helper function is correct and doesn't need changes
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

// Export a named function for the POST method
export async function POST(req) {
  try {
    // Get the request body
    const { imageData, mimeType } = await req.json();

    if (!imageData || !mimeType) {
      return NextResponse.json(
        { error: "Missing image data or mime type." },
        { status: 400 }
      );
    }

    // Use a fast and cost-effective model for vision tasks
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // The prompt tells the model exactly what to do
    const prompt = "Extract all text from this image. Preserve the original line breaks and formatting as closely as possible.";
    
    // Convert the Base64 image data from the request back into a buffer
    const imageBuffer = Buffer.from(imageData, 'base64');
    const imagePart = fileToGenerativePart(imageBuffer, mimeType);

    // Send the prompt and the image to the model
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Send the extracted text back to the frontend
    return NextResponse.json({ extractedText: text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "An error occurred while extracting text." },
      { status: 500 }
    );
  }
}