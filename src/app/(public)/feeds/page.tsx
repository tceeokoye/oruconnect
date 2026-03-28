"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Search, Filter, ChevronDown } from "lucide-react"
import ProviderPostCard from "@/components/provider-post-card"
import { NIGERIAN_STATES } from "@/lib/constants/nigerian-states"
import type { ProviderPost } from "@/types"

export default function FeedsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedState, setSelectedState] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts")
        const data = await response.json()
        setPosts(data.posts || [])
      } catch (error) {
        console.error("Failed to fetch posts", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  // Get unique categories safely based on actual database category
  const categories = ["All", ...new Set(posts.map((p) => p.category).filter(Boolean))]

  // Filter posts by search, category, and state
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.providerName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory

    // Since ProviderPost doesn't easily expose location out of the box we ignore state filter temporarily
    const matchesState = true 

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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-card border border-border rounded-xl h-96 w-full flex flex-col">
                  <div className="flex items-center gap-3 p-4 border-b border-border">
                    <div className="w-10 h-10 rounded-full bg-muted"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted rounded"></div>
                      <div className="h-3 w-20 bg-muted rounded"></div>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-full bg-muted rounded"></div>
                    <div className="h-4 w-4/5 bg-muted rounded"></div>
                  </div>
                  <div className="bg-muted flex-grow m-4 rounded-lg mt-0"></div>
                </div>
              ))}
            </div>
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
