// app/api/auth/me/route.js
import { NextResponse } from "next/server";

export async function GET(req) {
  const sessionCookie = req.cookies.get("session")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const sessionData = JSON.parse(sessionCookie);
    return NextResponse.json(sessionData);
  } catch (error) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}