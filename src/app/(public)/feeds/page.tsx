"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Search, Filter, ChevronDown } from "lucide-react"
import ProviderPostCard from "@/components/provider-post-card"
import { NIGERIAN_STATES } from "@/lib/constants/nigerian-states"
import type { ProviderPost } from "@/types"

// Dummy posts that match the ProviderPost type + category
const DUMMY_POSTS: (ProviderPost & { category: string; state: string })[] = [
  {
    id: "1",
    providerId: "p1",
    providerName: "ElectroWorks Pro",
    businessName: "ElectroWorks Pro Ltd",
    verified: true,
    type: "video",
    caption: "Installed solar panels and wiring for a residential home.",
    category: "Electrical",
    state: "Lagos",
    mediaUrl: "/electrical-services.mp4",
    mediaThumbnail: "/electrical-services.jpg",
    status: "approved",
    likes: 12,
    comments: 3,
    shares: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    providerId: "p2",
    providerName: "Plumb Masters",
    businessName: "Plumb Masters Ltd",
    verified: false,
    type: "video",
    caption: "Repaired leaking pipes and installed new faucets.",
    category: "Plumbing",
    state: "Lagos",
    mediaUrl: "/plumbing-services.mp4",
    mediaThumbnail: "/plumbing-services.png",
    status: "approved",
    likes: 7,
    comments: 2,
    shares: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    providerId: "p3",
    providerName: "Interior Design Hub",
    businessName: "Interior Design Hub Ltd",
    verified: true,
    type: "text",
    caption: "Redesigned a living room with modern decor.",
    category: "Design",
    state: "Lagos",
    mediaUrl: "/modern-living-room.png",
    mediaThumbnail: "/modern-living-room.png",
    status: "approved",
    likes: 20,
    comments: 5,
    shares: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    providerId: "p4",
    providerName: "Cleaning Pros",
    businessName: "Cleaning Pros Ltd",
    verified: false,
    type: "video",
    caption: "Cleaned office space thoroughly.",
    category: "Cleaning",
    state: "Abuja",
    mediaUrl: "/home-cleaning.mp4",
    mediaThumbnail: "/home-cleaning.png",
    status: "approved",
    likes: 8,
    comments: 1,
    shares: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    providerId: "p5",
    providerName: "Carpenter's Choice",
    businessName: "Carpenter's Choice Ltd",
    verified: true,
    type: "text",
    caption: "Built a custom dining table set.",
    category: "Carpentry",
    state: "Oyo",
    mediaUrl: "/carpentry-workshop.png",
    mediaThumbnail: "/carpentry-workshop.png",
    status: "approved",
    likes: 15,
    comments: 4,
    shares: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default function FeedsPage() {
  const [posts, setPosts] = useState(DUMMY_POSTS)
  const [loading, setLoading] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedState, setSelectedState] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Get unique categories
  const categories = ["All", ...new Set(posts.map((p) => p.category))]

  // Filter posts by search, category, and state
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.providerName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory

    // Since ProviderPost doesn't have a `state`, we will skip state filtering
    const matchesState = !selectedState // You can extend this if your data has `state`

    return matchesSearch && matchesCategory && matchesState
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <motion.div className="space-y-4 mb-10" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold">Provider Feeds</h1>
        <p className="text-muted-foreground">
          Explore real work, updates, and success stories from verified providers
        </p>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
          <input
            placeholder="Search feeds or providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </motion.div>

      <div className="flex gap-6">
        {/* Filters */}
        <div className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-64 space-y-6`}>
          {/* Category */}
          <div>
            <h3 className="font-semibold mb-2">Category</h3>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background"
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {(selectedCategory !== "All") && (
            <button
              onClick={() => setSelectedCategory("All")}
              className="text-sm text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Feed Grid */}
        <div className="flex-1">
          {/* Mobile Filter Toggle */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full border px-4 py-2 rounded-lg flex justify-between items-center"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          {loading ? (
            <p className="text-center py-12">Loading feeds...</p>
          ) : filteredPosts.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">No feeds found</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProviderPostCard post={post} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
