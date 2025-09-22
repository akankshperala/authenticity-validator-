import multer from 'multer';
import Tesseract from 'tesseract.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Dummy function to replace database insert
async function insertOrdersForVLE(vle_id, orders) {
  console.log('📥 Insert VLE Orders:', vle_id, orders);
  // Here you would insert into your database (Supabase, MongoDB, etc.)
}

// Prompt formatter
const formatPrompt = (ocrText) => `
You are a professional assistant that creates structured reports from OCR text.
The document starts with a VLEId, VLE name, address, machine details, and a cell number.
Then a table of orders with details: date, place, farmer name, cell number, type of service, and income.

Generate a clean report in markdown format.
OCR Text:
${ocrText}
`;

// Parse report into structured object
function parseReport(report) {
  const lines = report.split('\n').map(l => l.trim()).filter(Boolean);
  let vle_id = 'VLE123'; // For demo
  const orders = lines
    .filter(l => l.startsWith('|'))
    .map(l => {
      const cols = l.split('|').map(c => c.trim());
      return {
        date: cols[1] || '',
        place: cols[2] || '',
        type_of_service: cols[3] || '',
        farmer_name: cols[4] || '',
        cell_no: cols[5] || '',
        income: Number(cols[6] || 0),
      };
    });
  return { vle_id, orders };
}

// API handler
export const POST = async (req) => {
  try {
    const body = await req.formData();
    const file = body.get('image');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
    }

    // Save file locally
    const filePath = path.join('uploads', file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // OCR using Tesseract
    const result = await Tesseract.recognize(filePath, 'eng');
    const ocrText = result.data.text;

    // Generate Groq prompt
    const prompt = formatPrompt(ocrText);

    // Call Groq API
    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are an expert report generator.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const report = groqResponse.data.choices?.[0]?.message?.content || 'No report generated';
    const { vle_id, orders } = parseReport(report);

    // Use dummy insert function
    await insertOrdersForVLE(vle_id, orders);

    // Delete uploaded file
    fs.unlinkSync(filePath);

    return new Response(JSON.stringify({ report, ocrText, vle_id, orders }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
