"use client"
import { useState } from 'react';

// Helper function to convert a file object to a Base64 string
const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]); // Get only the Base64 part
    reader.onerror = (error) => reject(error);
});

export default function ImageUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setExtractedText('');
    setError('');
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const base64Image = await toBase64(selectedFile);

      const response = await fetch('http://localhost:3000/api/extract-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64Image,
          mimeType: selectedFile.type,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      setExtractedText(data.extractedText);

    } catch (err) {
      setError('Failed to extract text. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>📝 Image to Text Converter</h2>
      <p>Upload an image to extract text using the Gemini Vision API.</p>
      
      <input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />
      <button onClick={handleSubmit} disabled={isLoading || !selectedFile}>
        {isLoading ? 'Extracting...' : 'Extract Text'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {extractedText && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px', whiteSpace: 'pre-wrap', background: '#f9f9f9' }}>
          <h3>Extracted Text:</h3>
          <p>{extractedText}</p>
        </div>
      )}
    </div>
  );
}