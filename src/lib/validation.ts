import { z } from "zod";

// ============ Common Schemas ============

export const MoneySchema = z
  .number()
  .positive("Amount must be positive")
  .min(1000, "Minimum amount is ₦1,000");

export const EmailSchema = z.string().email("Invalid email address");

export const PhoneSchema = z
  .string()
  .regex(/^[\d\s+()-]*$/, "Invalid phone number");

export const URLSchema = z.string().url("Invalid URL");

export const ObjectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

// ============ User Schemas ============

export const RegisterSchema = z.object({
  firstName: z.string().min(2, "First name is required").max(50),
  lastName: z.string().min(2, "Last name is required").max(50),
  email: EmailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[0-9]/, "Password must contain number")
    .regex(/[!@#$%^&*]/, "Password must contain special character"),
  role: z.enum(["client", "provider"]),
  nin: z.string().min(6, "NIN is required"),
});

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, "Password is required"),
});

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  phoneNumber: PhoneSchema.optional(),
  bio: z.string().max(500).optional(),
  profilePhoto: URLSchema.optional(),
});

// ============ Job Schemas ============

export const CreateJobSchema = z.object({
  title: z.string().min(5, "Title is required").max(200),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  priceType: z.enum(["fixed", "negotiable"]),
  fixedPrice: z.number().positive().optional(),
  deliveryTime: z.number().int().positive().optional(),
  tags: z.array(z.string()).max(10),
  images: z.array(URLSchema).max(5).optional(),
});

export const CreateJobRequestSchema = z.object({
  jobId: ObjectIdSchema,
  clientId: ObjectIdSchema,
  jobDescription: z.string().min(10, "Description too short").max(2000),
  timeframe: z.string().min(1, "Timeframe is required"),
  budget: MoneySchema.optional(),
  message: z.string().max(500).optional(),
  attachments: z.array(URLSchema).max(5).optional(),
});

// ============ Payment Schemas ============

export const InitializePaymentSchema = z.object({
  amount: MoneySchema,
  email: EmailSchema,
  jobRequestId: ObjectIdSchema,
  userId: ObjectIdSchema,
});

export const VerifyPaymentSchema = z.object({
  reference: z.string().min(1, "Reference is required"),
  jobRequestId: ObjectIdSchema,
});

export const WithdrawSchema = z.object({
  userId: ObjectIdSchema,
  amount: z.number().min(5000, "Minimum withdrawal is ₦5,000"),
  accountNumber: z.string().regex(/^\d{10}$/, "Invalid account number"),
  bankCode: z.string().min(3, "Invalid bank code"),
});

// ============ Dispute Schemas ============

export const CreateDisputeSchema = z.object({
  jobRequestId: ObjectIdSchema,
  escrowId: ObjectIdSchema,
  complainant: ObjectIdSchema,
  defendant: ObjectIdSchema,
  title: z.string().min(5, "Title is required").max(200),
  description: z.string().min(20, "Description too short").max(5000),
  evidence: z.array(URLSchema).max(10).optional(),
});

export const ResolveDisputeSchema = z.object({
  resolution: z.string().min(10, "Resolution too short").max(2000),
  resolutionType: z.enum(["full_refund", "complete_release", "split"]),
  resolvedBy: ObjectIdSchema,
  clientRefundPercentage: z.number().min(0).max(100).optional(),
});

// ============ Message Schemas ============

export const SendMessageSchema = z.object({
  sender: ObjectIdSchema,
  recipient: ObjectIdSchema,
  content: z.string().min(1, "Message cannot be empty").max(5000),
  conversationId: ObjectIdSchema.optional(),
  attachments: z.array(URLSchema).max(5).optional(),
});

// ============ Admin Schemas ============

export const CreateAdminSchema = z.object({
  userId: ObjectIdSchema,
  role: z.enum([
    "super_admin",
    "tech_admin",
    "disputes_admin",
    "content_admin",
    "finance_admin",
  ]),
  assignedBy: ObjectIdSchema,
});

export const UpdateAdminStatusSchema = z.object({
  status: z.enum(["active", "inactive", "suspended"]),
  requestedBy: ObjectIdSchema,
});

// ============ Help Center Schemas ============

export const validateCreateHelpTicket = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  category: z.enum(["technical", "payment", "account", "dispute", "job", "general"]),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

export const validateHelpTicketMessage = z.object({
  message: z.string().min(1, "Message cannot be empty").max(5000),
  ticketId: ObjectIdSchema,
});

export const validateTransferToTechAdmin = z.object({
  ticketId: ObjectIdSchema,
  reason: z.string().min(10).max(500),
  adminId: ObjectIdSchema,
});

// ============ Feed Interaction Schemas ============

export const validateLikePost = z.object({
  postId: ObjectIdSchema,
  action: z.enum(["like", "unlike"]),
});

export const validateCommentPost = z.object({
  postId: ObjectIdSchema,
  content: z.string().min(1, "Comment cannot be empty").max(5000),
});

export const validateSharePost = z.object({
  postId: ObjectIdSchema,
});

// ============ Validation Utility ============

export async function validateRequest<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const validated = await schema.parseAsync(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
      return { success: false, error: messages.join(", ") };
    }
    return { success: false, error: "Validation failed" };
  }
}

/**
 * Extract user ID from request headers or body
 */
export function extractUserId(request: any): string | null {
  try {
    // Handle NextRequest
    if (request && typeof request === "object") {
      // Try to get from cookies (JWT stored in cookies)
      const cookieAuth = request.cookies?.get?.("auth")?.value;
      if (cookieAuth) {
        try {
          const payload = JSON.parse(
            Buffer.from(cookieAuth.split(".")[1], "base64").toString()
          );
          return payload.userId || payload.sub || null;
        } catch {
          return null;
        }
      }

      // Try to get from Authorization header
      const authHeader = request.headers?.get?.("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        try {
          const payload = JSON.parse(
            Buffer.from(token.split(".")[1], "base64").toString()
          );
          return payload.userId || payload.sub || null;
        } catch {
          return null;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .trim()
    .substring(0, 5000); // Limit length
}

/**
 * Sanitize object by recursively applying sanitization
 */
export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string" ? sanitizeString(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
