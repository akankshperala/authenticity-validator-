// middleware.js
import { NextResponse } from "next/server";

export function middleware(req) {
  const sessionCookie = req.cookies.get("session")?.value;
  const { pathname } = req.nextUrl;

  // If there's no session cookie, redirect to login
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const session = JSON.parse(sessionCookie);

    // Check if the user is an institution_admin
    if (session.role !== 'institution_admin') {
      // If not, deny access by redirecting them
      return NextResponse.redirect(new URL("/", req.url)); 
    }
  } catch (error) {
    // If cookie is invalid, also redirect to login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If the user is an institution_admin, allow the request to proceed
  return NextResponse.next();
}

// Apply this middleware only to the institution dashboard route
export const config = {
  matcher: "/institution-dashboard/:path*",
};