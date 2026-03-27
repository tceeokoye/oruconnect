import mongoose from "mongoose";

export interface Business {
  id: string
  name: string
  description: string
  categoryId: string
  subcategoryId: string
  state: string
  city: string
  verified: boolean
  rating: number
  reviewCount: number
  logo?: string
  banner?: string
  phone: string
  email: string
  nin?: string
  cac?: string
  owner: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

export interface Service {
  id: string
  businessId: string
  name: string
  description: string
  basePrice: number
  currency: "NGN"
  category: string
  subcategory: string
}

export interface Job {
  id: string
  clientId: string
  providerId: string
  title: string
  description: string
  budget: number
  timeline: string
  status: "pending" | "accepted" | "in_progress" | "completed" | "disputed"
  escrowAmount: number
  createdAt: string
}

export interface Category {
  id: string
  name: string
  description: string
  icon?: string
  subcategories: Subcategory[]
}

export interface Subcategory {
  id: string
  name: string
  categoryId: string
}

export interface Review {
  id: string
  businessId: string
  clientId: string
  rating: number
  comment: string
  createdAt: string
}

export interface NigerianState {
  name: string
  code: string
  cities: string[]
}

export interface ProviderPost {
  id: string
  providerId: string
  providerName: string
  providerAvatar?: string
  businessName: string
  verified: boolean
  type: "text" | "video" | "video_with_text"
  caption: string
  category: string            // added category
  state: string               // added state
  mediaUrl?: string
  mediaThumbnail?: string
  mediaType?: "video" | "image"
  status: "pending" | "approved" | "hidden" | "rejected"
  likes: number
  comments: number
  shares: number
  createdAt: string
  updatedAt: string
}


export interface PostStats {
  totalPosts: number
  approvedPosts: number
  pendingPosts: number
  hiddenPosts: number
}





declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

export {};


export interface Comment {
  id: string
  postId: string
  userId: string
  userName: string
  userAvatar?: string
  userRole: "client" | "provider" | "admin" | "sub_admin"
  text: string
  createdAt: string
}
