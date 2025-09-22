"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";
import certs from "@/certs.json";
import stringSimilarity from "string-similarity";

export default function OCRVerify() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState("");

  const handleUpload = (e) => {
    setFile(e.target.files[0]);
    setText("");
    setResult("");
  };

  const handleOCR = () => {
    if (!file) return;

    Tesseract.recognize(file, "eng")
      .then(({ data: { text } }) => {
        const cleanedText = text.replace(/\s+/g, " ").toUpperCase();
        setText(text);

        // Extract fields
        const nameOCRMatch = cleanedText.match(/NAME\s*[©:|]?\s*([A-Z ]+)/i);
        const courseOCRMatch = cleanedText.match(/EXAMINATION\s*©?\s*([A-Z0-9 ().]+)/i);
        const sgpaOCRMatch = cleanedText.match(/\(SGPA\)\s*©\s*([0-9.]+)/i);
        const cgpaOCRMatch = cleanedText.match(/\(CGPA\)\s*[:]?\s*([0-9.]+)/i);

        const nameOCR = nameOCRMatch ? nameOCRMatch[1].trim() : "";
        const courseOCR = courseOCRMatch ? courseOCRMatch[1].trim() : "";
        const sgpaOCR = sgpaOCRMatch ? parseFloat(sgpaOCRMatch[1]) : null;
        const cgpaOCR = cgpaOCRMatch ? parseFloat(cgpaOCRMatch[1]) : null;

        // Fuzzy matching and validation
        let found = certs.find((c) => {
          const nameScore = stringSimilarity.compareTwoStrings(nameOCR, c.name.toUpperCase());
          const courseScore = stringSimilarity.compareTwoStrings(courseOCR, c.course.toUpperCase());
          const sgpaValid = sgpaOCR && Math.abs(sgpaOCR - parseFloat(c.sgpa)) < 0.05;
          const cgpaValid = cgpaOCR && Math.abs(cgpaOCR - parseFloat(c.cgpa)) < 0.05;
          return nameScore > 0.7 && courseScore > 0.3 && sgpaValid && cgpaValid;
        });

        if (found) {
          setResult(
            `✅ Valid Certificate\nName: ${found.name}\nCourse: ${found.course}\nSGPA: ${found.sgpa}\nCGPA: ${found.cgpa}`
          );
        } else {
          // Detailed verification check
          const detailed = certs.map((c) => {
            const nameScore = stringSimilarity.compareTwoStrings(nameOCR, c.name.toUpperCase());
            const courseScore = stringSimilarity.compareTwoStrings(courseOCR, c.course.toUpperCase());
            const sgpaValid = sgpaOCR && Math.abs(sgpaOCR - c.sgpa) < 0.05;
            const cgpaValid = cgpaOCR && Math.abs(cgpaOCR - c.cgpa) < 0.05;

            return `Certificate ${c.name}:
  - Name match: ${nameScore > 0.7 ? "✅" : `❌ (OCR=${nameOCR}, DB=${c.name})`}
  - Course match: ${courseScore > 0.7 ? "✅" : `❌ (OCR=${courseOCR}, DB=${c.course})`}
  - SGPA match: ${sgpaValid ? "✅" : `❌ (OCR=${sgpaOCR}, DB=${c.sgpa})`}
  - CGPA match: ${cgpaValid ? "✅" : `❌ (OCR=${cgpaOCR}, DB=${c.cgpa})`}
`;
          });

          setResult(`❌ Verification Failed:\n${detailed.join("\n")}`);
        }
      })
      .catch(() => setResult("Error reading file"));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg text-center text-black">
        <h1 className="text-2xl font-bold mb-6">🔎 OCR Certificate Verification</h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="mb-4"
        />

        <button
          onClick={handleOCR}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Verify Certificate
        </button>

        {text && (
          <div className="mt-4 text-left text-sm bg-gray-50 p-3 rounded">
            <h2 className="font-semibold mb-2">Extracted Text (OCR):</h2>
            <pre className="whitespace-pre-wrap">{text}</pre>
          </div>
        )}

        {result && (
          <div className="mt-4 text-left text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
            {result.includes("✅") ? (
              <p className="text-green-600">{result}</p>
            ) : (
              <p className="text-red-600">{result}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
