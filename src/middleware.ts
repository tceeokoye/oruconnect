import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes and the roles allowed to access them
// Prisma Roles: USER, PROFESSIONAL, SUPER_ADMIN, OPERATIONS_ADMIN, CATEGORY_ADMIN, CONTENT_ADMIN, SUPPORT_ADMIN
const roleRouteMap: Record<string, string[]> = {
  "/admin": ["SUPER_ADMIN", "OPERATIONS_ADMIN", "CATEGORY_ADMIN", "CONTENT_ADMIN", "SUPPORT_ADMIN"],
  "/admin/settings": ["SUPER_ADMIN"],
  "/admin/users": ["SUPER_ADMIN", "OPERATIONS_ADMIN"],
  "/admin/bookings": ["SUPER_ADMIN", "OPERATIONS_ADMIN", "SUPPORT_ADMIN"],
  "/admin/content": ["SUPER_ADMIN", "CONTENT_ADMIN"],
  "/dashboard/client": ["USER", "SUPER_ADMIN"],
  "/dashboard/provider": ["PROFESSIONAL", "SUPER_ADMIN"],
};

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

// Helper function to decode JWT payload without external libraries on the Edge
function decodeJwtPayload(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sortedRoutes = Object.keys(roleRouteMap).sort((a, b) => b.length - a.length);
  const protectedRoute = sortedRoutes.find((route) => pathname.startsWith(route));

  if (!protectedRoute) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get("auth_token");
  const token = tokenCookie?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    const decoded = decodeJwtPayload(token);

    if (!decoded) {
      throw new Error("Invalid token");
    }

    if (decoded.exp * 1000 < Date.now()) {
      const response = NextResponse.redirect(new URL("/auth/login", request.url));
      response.cookies.delete("auth_token");
      return response;
    }

    const allowedRoles = roleRouteMap[protectedRoute];
    const userRole = decoded.role;

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/", request.url)); 
    }

    const response = NextResponse.next();
    response.headers.set("x-user-role", userRole);
    return response;
  } catch (error) {
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("auth_token");
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
  ],
};
