// // import { GoogleGenerativeAI } from "@google/generative-ai";
// // import { NextResponse } from 'next/server';
// // import stringSimilarity from "string-similarity";
// // import certs from "@/certs.json";

// // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // function fileToGenerativePart(buffer, mimeType) {
// //   return { inlineData: { data: buffer.toString("base64"), mimeType } };
// // }

// // export async function POST(req) {
// //   try {
// //     const { imageData, mimeType } = await req.json();
// //     if (!imageData || !mimeType) {
// //       return NextResponse.json({ error: "Missing image data." }, { status: 400 });
// //     }

// //     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
// //     const prompt = `Extract all text from this academic grade sheet. Preserve the original structure and formatting as much as possible.`;
// //     const imageBuffer = Buffer.from(imageData, 'base64');
// //     const imagePart = fileToGenerativePart(imageBuffer, mimeType);

// //     const result = await model.generateContent([prompt, imagePart]);
// //     const text = result.response.text();
// //     // Use original text for multi-line regex, and a cleaned version for simpler fields
// //     const cleanedText = text.replace(/\s+/g, " ").toUpperCase();

// //     // --- UPDATED REGEX PATTERNS ---
// //     // Use a non-greedy match `(.+?)` and look for the next field ("Father Name") as an endpoint
// //     const nameOCRMatch = text.match(/Name\s*:\s*(.+?)\s*Father Name/i);
// //     // Same non-greedy approach, stopping at "Roll No."
// //     const courseOCRMatch = text.match(/Examination\s*:\s*(.+?)\s*Roll No/i);
// //     // Match the full descriptive text for SGPA and CGPA
// //     const sgpaOCRMatch = text.match(/Semester Grade Point Average \(SGPA\)\s*:\s*([0-9.]+)/i);
// //     const cgpaOCRMatch = text.match(/Cumulative Grade Point Average \(CGPA\)\s*:\s*([0-9.]+)/i);

// //     const nameOCR = nameOCRMatch ? nameOCRMatch[1].trim().toUpperCase() : "";
// //     const courseOCR = courseOCRMatch ? courseOCRMatch[1].trim().toUpperCase() : "";
// //     const sgpaOCR = sgpaOCRMatch ? parseFloat(sgpaOCRMatch[1]) : null;
// //     const cgpaOCR = cgpaOCRMatch ? parseFloat(cgpaOCRMatch[1]) : null;
// //     // --- END OF UPDATES ---

// //     const found = certs.find((c) => {
// //       const nameScore = stringSimilarity.compareTwoStrings(nameOCR, c.name.toUpperCase());
// //       const courseScore = stringSimilarity.compareTwoStrings(courseOCR, c.course.toUpperCase());
// //       const sgpaValid = sgpaOCR !== null && Math.abs(sgpaOCR - parseFloat(c.sgpa)) < 0.05;
// //       const cgpaValid = cgpaOCR !== null && Math.abs(cgpaOCR - parseFloat(c.cgpa)) < 0.05;
// //       return nameScore > 0.7 && courseScore > 0.7 && sgpaValid && cgpaValid;
// //     });

// //     if (found) {
// //       return NextResponse.json({ status: "VALID", certificate: found, ocrText: text });
// //     } else {
// //       const details = `Verification failed.\nOCR Data: Name=${nameOCR}, Course=${courseOCR}, SGPA=${sgpaOCR}, CGPA=${cgpaOCR}`;
// //       return NextResponse.json({ status: "INVALID", details: details, ocrText: text });
// //     }

// //   } catch (error) {
// //     console.error("API Error:", error);
// //     return NextResponse.json({ error: "An error occurred during verification." }, { status: 500 });
// //   }
// // }

// // pages/api/verify-certificate.js
// // File: app/api/verify-certificate/route.js

// import { NextResponse } from 'next/server';

// // This is a MOCK DATABASE. Replace this with your actual database connection.
// const mockDatabase = [
//   {
//     "id": "CB88831",
//     "rollNo": "160123733124",
//     "name": "PERALA AKANKSH",
//     "course": "B.E (COMPUTER SCLENCE AND ENGG) III Sem (MAIN) NOV 2024 (R22)",
//     "sgpa": "8.62",
//     "cgpa": "8.98",
//     "result": "PASS"
//   }
//   // ...other student records
// ];

// export async function GET(request) {
//   // In the App Router, you get search params from the request object.
//   const { searchParams } = new URL(request.url);
//   const id = searchParams.get('id');

//   if (!id) {
//     return NextResponse.json({ message: 'Certificate ID is required.' }, { status: 400 });
//   }

//   // Find the record in the database
//   const record = mockDatabase.find(student => student.id === id);

//   if (record) {
//     // Record found, verification successful
//     return NextResponse.json(record, { status: 200 });
//   } else {
//     // Record not found, verification failed
//     return NextResponse.json({ message: 'Certificate not found or invalid.' }, { status: 404 });
//   }
// }
// File: app/api/verify-certificate/route.js

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import stringSimilarity from "string-similarity";
import jsqr from "jsqr";
import jpeg from "jpeg-js";
import certs from "@/certs.json"; // Make sure the path to your certs.json is correct
import { PNG } from "pngjs";


// --- GET Handler for direct QR code ID verification ---
export async function GET(request) {
  console.log("hihi")
  const { searchParams } = new URL(request.url);
  const idFromQuery = searchParams.get('id');

  if (!idFromQuery) {
    return NextResponse.json({ message: 'Certificate ID is required.' }, { status: 400 });
  }

  // The QR might contain a full URL, so let's extract the ID
  let id = idFromQuery;
  try {
    const parsedUrl = new URL(idFromQuery);
    const parts = parsedUrl.pathname.split("/");
    id = parts[parts.length - 1] || id;
  } catch (e) {
    // It's not a URL, so we assume it's a raw ID
  }

  const record = certs.find(cert => cert.id === id);

  if (record) {
    return NextResponse.json(record, { status: 200 });
  } else {
    return NextResponse.json({ message: 'Certificate not found or invalid.' }, { status: 404 });
  }
}


// --- POST Handler for File Upload Verification (QR then OCR) ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { imageData, mimeType } = await req.json();
    // console.log("something",imageData,mimeType)
    if (!imageData || !mimeType) {
      return NextResponse.json({ error: "Missing image data." }, { status: 400 });
    }

    const imageBuffer = Buffer.from(imageData, 'base64');

    // --- Step 1: Attempt QR Code Verification First ---
    try {
      let width, height, data;
      console.log(width, data, "ljcbakhc")
      if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
        const jpegData = jpeg.decode(imageBuffer, { useTArray: true });
        width = jpegData.width;
        height = jpegData.height;
        data = jpegData.data;
      } else if (mimeType === 'image/png') {
        const pngData = PNG.sync.read(imageBuffer);
        console.log("hi")
        width = pngData.width;
        height = pngData.height;
        // The jsqr library expects a Uint8ClampedArray, which is what pngjs provides.
        data = new Uint8ClampedArray(pngData.data);
      }
      console.log(width, data, "ljcbakhc")
      if (width && data) {
        const code = jsqr(data, width, height);
        console.log("code.........././.", code.data)
        const parsedUrl = new URL(code.data);
        const parts = parsedUrl.pathname.split("/");
        const id = parts[parts.length - 1];
        if (code) {
          // QR Code Found! Try to verify with its data.
          const record = certs.find(cert => cert.id === id);
          console.log("hlo", record)
          if (record) {
            return NextResponse.json({ status: "VALID", certificate: record, method: "QR_CODE" });
          }
        }
      }
    } catch (qrError) {
      console.log("QR Scan failed, falling back to OCR. Error:", qrError.message);
    }

    // --- Step 2: Fallback to Gemini OCR Verification ---
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = `Extract all text from this academic grade sheet. Preserve the original structure and formatting.`;
    const imagePart = { inlineData: { data: imageData, mimeType } };

    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();

    const nameOCRMatch = text.match(/Name\s*:\s*(.+?)\s*Father Name/i);
    const cgpaOCRMatch = text.match(/Cumulative Grade Point Average \(CGPA\)\s*:\s*([0-9.]+)/i);

    const nameOCR = nameOCRMatch ? nameOCRMatch[1].trim().toUpperCase() : "";
    const cgpaOCR = cgpaOCRMatch ? parseFloat(cgpaOCRMatch[1]) : null;

    const found = certs.find((c) => {
      const nameScore = stringSimilarity.compareTwoStrings(nameOCR, c.name.toUpperCase());
      const cgpaValid = cgpaOCR !== null && Math.abs(cgpaOCR - parseFloat(c.cgpa)) < 0.05;
      return nameScore > 0.8 && cgpaValid; // Using a higher threshold for better accuracy
    });

    if (found) {
      return NextResponse.json({ status: "VALID", certificate: found, ocrText: text, method: "OCR" });
    } else {
      const details = `Verification failed.\nOCR Data: Name=${nameOCR}, CGPA=${cgpaOCR}`;
      return NextResponse.json({ status: "INVALID", details: details, ocrText: text, method: "OCR" });
    }

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ status: 'ERROR', error: "An error occurred during verification." }, { status: 500 });
  }
}