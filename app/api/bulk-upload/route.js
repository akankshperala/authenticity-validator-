import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Papa from "papaparse"; // A library for parsing CSV files

const CERTIFICATES_FILE = path.join(process.cwd(), "certificates.json");

function loadCertificates() {
  if (!fs.existsSync(CERTIFICATES_FILE)) {
    return { certificates: [] };
  }
  const data = fs.readFileSync(CERTIFICATES_FILE, "utf8");
  return JSON.parse(data);
}

function saveCertificates(data) {
  fs.writeFileSync(CERTIFICATES_FILE, JSON.stringify(data, null, 2));
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("certificateData");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileContent = await file.text();
    const parsedData = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsedData.errors.length > 0) {
      return NextResponse.json({ error: "Error parsing CSV file" }, { status: 400 });
    }
    
    const newRecords = parsedData.data;
    const db = loadCertificates();
    
    db.certificates.push(...newRecords); 
    saveCertificates(db);

    return NextResponse.json(
      { message: `Successfully uploaded ${newRecords.length} records.` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Bulk upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}