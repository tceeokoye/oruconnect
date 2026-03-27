import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Middleware to verify JWT token
 */
export async function verifyAuth(request: NextRequest) {
  try {
    let token: string | undefined;

    // First try to get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } 
    // Fallback to HTTP-only cookie set by our login route
    else {
      token = request.cookies.get("auth_token")?.value;
    }

    if (!token) {
      return {
        authenticated: false,
        error: "Missing or invalid authorization token",
      };
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as DecodedToken;
      return {
        authenticated: true,
        user: decoded,
        token: decoded,
      };
    } catch (error) {
      return {
        authenticated: false,
        error: "Invalid or expired token",
      };
    }
  } catch (error) {
    return {
      authenticated: false,
      error: "Authentication check failed",
    };
  }
}

/**
 * Middleware to verify user role
 */
export async function verifyRole(
  userId: string,
  requiredRoles: string[]
) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return { authorized: false, error: "User not found" };
    }

    if (!requiredRoles.includes(user.role)) {
      return {
        authorized: false,
        error: `Insufficient permissions. Required role: ${requiredRoles.join(" or ")}`,
      };
    }

    return { authorized: true, user };
  } catch (error) {
    return { authorized: false, error: "Role verification failed" };
  }
}

/**
 * Middleware to verify admin permissions mapped to Prisma Roles
 */
export async function verifyAdminPermission(
  userId: string,
  requiredPermissions: string[]
) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.role === "USER" || user.role === "PROFESSIONAL") {
      return { authorized: false, error: "Admin not found or inactive" };
    }

    // Role-based mock permission map bridging legacy auth structures to new RBAC
    const rolePermissions: Record<string, string[]> = {
      SUPER_ADMIN: ["manage_users", "manage_finance", "manage_content", "manage_settings", "manage_categories", "view_reports"],
      OPERATIONS_ADMIN: ["manage_users", "manage_finance", "view_reports"],
      SUPPORT_ADMIN: ["view_reports", "manage_users"],
      CATEGORY_ADMIN: ["manage_categories", "view_reports"],
      CONTENT_ADMIN: ["manage_content"]
    };

    const adminPerms = rolePermissions[user.role] || [];

    const hasAllPermissions = requiredPermissions.every((perm) =>
      adminPerms.includes(perm)
    );

    if (!hasAllPermissions) {
      return {
        authorized: false,
        error: `Missing permissions: ${requiredPermissions.join(", ")}`,
      };
    }

    return { authorized: true, admin: user };
  } catch (error) {
    return { authorized: false, error: "Permission verification failed" };
  }
}

/**
 * Protected route wrapper
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, auth: DecodedToken) => Promise<Response>
) {
  const auth = await verifyAuth(request);

  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: 401 }
    );
  }

  try {
    return await handler(request, auth.token as DecodedToken);
  } catch (error) {
    console.error("Handler error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Protected route with role check
 */
export async function withRole(
  request: NextRequest,
  handler: (request: NextRequest, auth: DecodedToken) => Promise<Response>,
  requiredRoles: string[]
) {
  const auth = await verifyAuth(request);

  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const roleCheck = await verifyRole(
    auth.token?.userId || "",
    requiredRoles
  );

  if (!roleCheck.authorized) {
    return NextResponse.json(
      { success: false, message: roleCheck.error },
      { status: 403 }
    );
  }

  try {
    return await handler(request, auth.token as DecodedToken);
  } catch (error) {
    console.error("Handler error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Protected route with admin permission check
 */
export async function withAdminPermission(
  request: NextRequest,
  handler: (request: NextRequest, auth: DecodedToken) => Promise<Response>,
  requiredPermissions: string[]
) {
  const auth = await verifyAuth(request);

  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const permissionCheck = await verifyAdminPermission(
    auth.token?.userId || "",
    requiredPermissions
  );

  if (!permissionCheck.authorized) {
    return NextResponse.json(
      { success: false, message: permissionCheck.error },
      { status: 403 }
    );
  }

  try {
    return await handler(request, auth.token as DecodedToken);
  } catch (error) {
    console.error("Handler error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Rate limiting middleware
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
) {
  return (key: string) => {
    const now = Date.now();
    const record = requestCounts.get(key);

    if (!record || now > record.resetTime) {
      requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1 };
    }

    if (record.count >= maxRequests) {
      return {
        allowed: false,
        error: "Too many requests, please try again later",
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      };
    }

    record.count++;
    return { allowed: true, remaining: maxRequests - record.count };
  };
}

/**
 * Get client IP for rate limiting
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}
