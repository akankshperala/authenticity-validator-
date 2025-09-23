import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";

const FILE = path.join(process.cwd(), "users.json");

function loadUsers() {
  if (!fs.existsSync(FILE)) return { users: [] };
  const data = fs.readFileSync(FILE, "utf8");
  return JSON.parse(data || '{"users":[]}');
}

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const data = loadUsers();
    const user = data.users.find((u) => u.username === username);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // ✅ Login successful: set session cookie
    const response = NextResponse.json({
      message: "Login successful",
      role: user.role,
    });

    response.cookies.set({
      name: "session",
      value: JSON.stringify({ username: user.username, role: user.role }),
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
