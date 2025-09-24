// app/api/colleges/route.js

let colleges = [
  { id: 1, name: "IIT Delhi", address: "New Delhi" },
  { id: 2, name: "NIT Trichy", address: "Trichy" }
];

export async function GET() {
  return Response.json({ colleges });
}

export async function POST(req) {
  const { name, address } = await req.json();
  if (!name || !address) {
    return Response.json({ error: "Name and address are required" }, { status: 400 });
  }
  const newCollege = { id: Date.now(), name, address };
  colleges.push(newCollege);
  return Response.json({ college: newCollege });
}
