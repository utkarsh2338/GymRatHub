import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/workouts",
  "/nutrition",
  "/planner",
  "/progress",
  "/community",
  "/challenges",
  "/trainers",
  "/settings",
  "/premium",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if pathname starts with any protected route
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route) || pathname === route
  );

  if (isProtected) {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      // Redirect to /auth if trying to access a protected route without a token
      const loginUrl = new URL("/auth", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpeg|jpg|png|gif|svg|ico|webp|mul|xml|txt|woff2?|ttf|svg|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
