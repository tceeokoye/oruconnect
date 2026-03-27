import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    businessName: z.string().min(3, "Business name is required"),
    businessEmail: z.string().email("Invalid business email"),
    businessPhone: z.string().min(11, "Valid phone number required"),
    categoryId: z.string().min(1, "Category is required"),
    subcategoryId: z.string().min(1, "Subcategory is required"),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    businessDescription: z.string().min(20, "Business description is required"),
    nin: z.string().min(11, "Valid NIN required"),
    ninImage: z.string().min(1, "NIN Image is required"),
    faceImage: z.string().min(1, "Face Verification selfie is required"),
    cacImage: z.string().optional(),
    cac: z.string().optional(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export const createPostSchema = z.object({
  caption: z.string().max(500, "Caption must be less than 500 characters").optional().or(z.literal("")),
})

export const videoUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 50 * 1024 * 1024, "Video must be less than 50MB")
    .refine((file) => ["video/mp4", "video/webm", "video/quicktime"].includes(file.type), "Invalid video format"),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type CreatePostFormData = z.infer<typeof createPostSchema>
export type VideoUploadFormData = z.infer<typeof videoUploadSchema>
