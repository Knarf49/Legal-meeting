import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth/auth-edge";

const protectedRoutes = ["/userInfo", "/meeting"];
const authRoutes = ["/login", "/signup"];

export default async function middleware(request: NextRequest) {
  const session = await auth();

  const { pathname } = request.nextUrl;

  // Check if it's an auth route (login/signup)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If logged in and trying to access auth routes, redirect to home
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check if route is protected
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If protected route and not logged in, redirect to login
  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
