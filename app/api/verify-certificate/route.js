import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import stringSimilarity from "string-similarity";
import certs from "@/certs.json";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function fileToGenerativePart(buffer, mimeType) {
  return { inlineData: { data: buffer.toString("base64"), mimeType } };
}

export async function POST(req) {
  try {
    const { imageData, mimeType } = await req.json();
    if (!imageData || !mimeType) {
      return NextResponse.json({ error: "Missing image data." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = `Extract all text from this academic grade sheet. Preserve the original structure and formatting as much as possible.`;
    const imageBuffer = Buffer.from(imageData, 'base64');
    const imagePart = fileToGenerativePart(imageBuffer, mimeType);

    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();
    // Use original text for multi-line regex, and a cleaned version for simpler fields
    const cleanedText = text.replace(/\s+/g, " ").toUpperCase();

    // --- UPDATED REGEX PATTERNS ---
    // Use a non-greedy match `(.+?)` and look for the next field ("Father Name") as an endpoint
    const nameOCRMatch = text.match(/Name\s*:\s*(.+?)\s*Father Name/i);
    // Same non-greedy approach, stopping at "Roll No."
    const courseOCRMatch = text.match(/Examination\s*:\s*(.+?)\s*Roll No/i);
    // Match the full descriptive text for SGPA and CGPA
    const sgpaOCRMatch = text.match(/Semester Grade Point Average \(SGPA\)\s*:\s*([0-9.]+)/i);
    const cgpaOCRMatch = text.match(/Cumulative Grade Point Average \(CGPA\)\s*:\s*([0-9.]+)/i);

    const nameOCR = nameOCRMatch ? nameOCRMatch[1].trim().toUpperCase() : "";
    const courseOCR = courseOCRMatch ? courseOCRMatch[1].trim().toUpperCase() : "";
    const sgpaOCR = sgpaOCRMatch ? parseFloat(sgpaOCRMatch[1]) : null;
    const cgpaOCR = cgpaOCRMatch ? parseFloat(cgpaOCRMatch[1]) : null;
    // --- END OF UPDATES ---

    const found = certs.find((c) => {
      const nameScore = stringSimilarity.compareTwoStrings(nameOCR, c.name.toUpperCase());
      const courseScore = stringSimilarity.compareTwoStrings(courseOCR, c.course.toUpperCase());
      const sgpaValid = sgpaOCR !== null && Math.abs(sgpaOCR - parseFloat(c.sgpa)) < 0.05;
      const cgpaValid = cgpaOCR !== null && Math.abs(cgpaOCR - parseFloat(c.cgpa)) < 0.05;
      return nameScore > 0.7 && courseScore > 0.7 && sgpaValid && cgpaValid;
    });

    if (found) {
      return NextResponse.json({ status: "VALID", certificate: found, ocrText: text });
    } else {
      const details = `Verification failed.\nOCR Data: Name=${nameOCR}, Course=${courseOCR}, SGPA=${sgpaOCR}, CGPA=${cgpaOCR}`;
      return NextResponse.json({ status: "INVALID", details: details, ocrText: text });
    }

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "An error occurred during verification." }, { status: 500 });
  }
}