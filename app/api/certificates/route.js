// app/api/certificates/route.js

import { NextResponse } from 'next/server';
import certificates from '@/certificates.json';

export async function GET() {
  try {
    // Return a JSON response with the certificates
    return NextResponse.json({ certificates: certificates.certificates });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json({ error: "Failed to load certificates." }, { status: 500 });
  }
}