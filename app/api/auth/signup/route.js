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

function saveUsers(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export async function POST(req) {
  try {
    const { username, password, role, university} = await req.json();

    if (!username || !password || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const data = loadUsers();

    if (data.users.find((u) => u.username === username)) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = { username, password: hashedPassword, role,  university: role === "institution_admin" ? university : null };
    data.users.push(newUser);
    saveUsers(data);

    // ✅ Signup successful: automatically log in user
    const response = NextResponse.json({
      message: "User registered successfully",
      role: role,
    });

    response.cookies.set({
      name: "session",
      value: JSON.stringify({ username, role }),
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
