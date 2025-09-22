"use client";

import { useState } from "react";

// Helper function to convert a file object to a Base64 string
const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
});

export default function CertificateVerifier() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null); // Stores the entire result object

  const handleUpload = (e) => {
    setFile(e.target.files[0]);
    setResult(null); // Clear previous results
  };

  const handleVerify = async () => {
    if (!file) return;

    setIsLoading(true);
    setResult(null);

    try {
      const base64Image = await toBase64(file);

      const response = await fetch('/api/verify-certificate', { // Use the new endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: base64Image,
          mimeType: file.type,
        }),
      });

      const data = await response.json();
      setResult(data);

    } catch (err) {
      setResult({ status: 'ERROR', details: 'Failed to connect to the server.' });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg text-center text-black">
        <h1 className="text-2xl font-bold mb-6">🔎 Gemini Certificate Verification</h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        <button
          onClick={handleVerify}
          disabled={isLoading || !file}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
        >
          {isLoading ? 'Verifying...' : 'Verify Certificate'}
        </button>

        {result && (
          <div className="mt-4 text-left text-sm bg-gray-50 p-3 rounded">
            {result.status === 'VALID' && (
              <div className="text-green-600 whitespace-pre-wrap">
                <h3 className="font-bold text-lg">✅ Valid Certificate</h3>
                <p>Name: {result.certificate.name}</p>
                <p>Course: {result.certificate.course}</p>
                <p>SGPA: {result.certificate.sgpa}</p>
                <p>CGPA: {result.certificate.cgpa}</p>
              </div>
            )}
            {result.status === 'INVALID' && (
              <div className="text-red-600 whitespace-pre-wrap">
                <h3 className="font-bold text-lg">❌ Verification Failed</h3>
                <p>{result.details}</p>
              </div>
            )}
             {result.status === 'ERROR' && (
              <div className="text-red-600 whitespace-pre-wrap">
                <h3 className="font-bold text-lg">🚨 Error</h3>
                <p>{result.error || "An unknown error occurred."}</p>
              </div>
            )}
            <details className="mt-4 cursor-pointer">
                <summary className="font-semibold">Show Raw OCR Text</summary>
                <pre className="whitespace-pre-wrap bg-gray-200 p-2 rounded mt-2 text-xs">{result.ocrText || "No text extracted."}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}