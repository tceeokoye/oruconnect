"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Eye, EyeOff, Trash2, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import type { ProviderPost } from "@/types"

export default function AdminPostsContent() {
  const [posts, setPosts] = useState<ProviderPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<ProviderPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts?limit=100")
        const data = await response.json()
        setPosts(data.posts || [])
      } catch (error) {
        console.error("Failed to fetch posts")
        toast.error("Failed to load posts")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  useEffect(() => {
    let filtered = posts

    if (filterStatus !== "all") {
      filtered = filtered.filter((post) => post.status === filterStatus)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.caption.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredPosts(filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }, [posts, filterStatus, searchTerm])

  const handleApprove = async (postId: string) => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}/approve`, {
        method: "POST",
      })

      if (response.ok) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: "approved" } : p)))
        toast.success("Post approved")
      } else {
        toast.error("Failed to approve post")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const handleHide = async (postId: string) => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}/hide`, {
        method: "POST",
      })

      if (response.ok) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: "hidden" } : p)))
        toast.success("Post hidden")
      } else {
        toast.error("Failed to hide post")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const response = await fetch(`/api/admin/posts/${postId}/delete`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId))
        toast.success("Post deleted")
      } else {
        toast.error("Failed to delete post")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const stats = {
    total: posts.length,
    pending: posts.filter((p) => p.status === "pending").length,
    approved: posts.filter((p) => p.status === "approved").length,
    hidden: posts.filter((p) => p.status === "hidden").length,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-secondary/10 text-secondary">Approved</span>
        )
      case "pending":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/10 text-yellow-600">Pending</span>
        )
      case "hidden":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-500/10 text-orange-600">Hidden</span>
        )
      case "rejected":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-destructive/10 text-destructive">
            Rejected
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Post Moderation</h1>
        <p className="text-muted-foreground mt-1">Review and manage provider content posts</p>
      </motion.div>

      {/* Stats */}
      <motion.div className="grid md:grid-cols-4 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Posts</p>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Pending Review</p>
          <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="text-2xl font-bold mt-1 text-secondary">{stats.approved}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Hidden</p>
          <p className="text-2xl font-bold mt-1 text-orange-600">{stats.hidden}</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div className="flex gap-4 flex-col md:flex-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by provider, business, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex gap-2">
          {["all", "pending", "approved", "hidden"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === status ? "bg-primary text-white" : "border border-border hover:border-primary"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Posts List */}
      <motion.div
        className="space-y-4"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="visible"
      >
        {isLoading ? (
          <div className="flex justify-center py-12">
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts found</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              whileHover={{ x: 4 }}
              className="bg-card border border-border rounded-lg p-6 space-y-4 hover:shadow-lg transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                      {post.providerName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold">{post.providerName}</h3>
                      <p className="text-sm text-muted-foreground">{post.businessName}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(post.status)}
                  <p className="text-xs text-muted-foreground mt-2">{new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Caption */}
              <p className="text-foreground line-clamp-2">{post.caption}</p>

              {/* Media */}
              {post.mediaUrl && (
                <div className="bg-muted rounded-lg overflow-hidden h-32">
                  {post.type === "text" ? (
                    <img src={post.mediaUrl || "/placeholder.svg"} alt="Post" className="w-full h-full object-cover" />
                  ) : (
                    <video src={post.mediaUrl} poster={post.mediaThumbnail} className="w-full h-full object-cover" />
                  )}
                </div>
              )}

              {/* Post Type & Engagement */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="px-2 py-1 bg-muted rounded text-xs font-medium">
                  {post.type === "video_with_text"
                    ? "Video + Text"
                    : post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                </span>
                <span>
                  {post.likes} likes • {post.comments} comments
                </span>
              </div>

              {/* Actions */}
              {post.status === "pending" && (
                <div className="border-t border-border pt-4 flex gap-2">
                  <button
                    onClick={() => handleApprove(post.id)}
                    className="flex-1 px-4 py-2 bg-secondary/10 text-secondary border border-secondary/30 rounded-lg hover:bg-secondary hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleHide(post.id)}
                    className="flex-1 px-4 py-2 bg-orange-500/10 text-orange-600 border border-orange-500/30 rounded-lg hover:bg-orange-500 hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <EyeOff className="w-4 h-4" />
                    Hide
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="flex-1 px-4 py-2 bg-destructive/10 text-destructive border border-destructive/30 rounded-lg hover:bg-destructive hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}

              {post.status === "hidden" && (
                <div className="border-t border-border pt-4 flex gap-2">
                  <button
                    onClick={() => handleApprove(post.id)}
                    className="flex-1 px-4 py-2 bg-secondary/10 text-secondary border border-secondary/30 rounded-lg hover:bg-secondary hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Restore
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="flex-1 px-4 py-2 bg-destructive/10 text-destructive border border-destructive/30 rounded-lg hover:bg-destructive hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}
