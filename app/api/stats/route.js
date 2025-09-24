// app/api/stats/route.js

let stats = {
  totalUsers: 1025,
  totalColleges: 38,
  forgeryCases: 14,
  forgeryTrend: [
    { month: "May", count: 2 },
    { month: "June", count: 4 },
    { month: "July", count: 3 },
    { month: "August", count: 5 }
  ]
};

export async function GET() {
  return Response.json(stats);
}
