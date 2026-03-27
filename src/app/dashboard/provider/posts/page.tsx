"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreatePostForm from "@/components/create-post-form"
import ProviderPostCard from "@/components/provider-post-card"
import { Loader2, AlertCircle } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import type { ProviderPost } from "@/types"

export default function ProviderPostsPage() {
  const user = useSelector((state: RootState) => state.auth.user)
  const [posts, setPosts] = useState<ProviderPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("create")

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user?.id) return

      try {
        const response = await fetch(`/api/posts?providerId=${user.id}`)
        const data = await response.json()
        setPosts(data.posts || [])
      } catch (error) {
        console.error("Failed to fetch posts")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [user?.id])

  const pendingPosts = posts.filter((p) => p.status === "pending")
  const approvedPosts = posts.filter((p) => p.status === "approved")
  const hiddenPosts = posts.filter((p) => p.status === "hidden")

  const handlePostCreated = () => {
    setActiveTab("all")
    const fetchPosts = async () => {
      if (!user?.id) return
      try {
        const response = await fetch(`/api/posts?providerId=${user.id}`)
        const data = await response.json()
        setPosts(data.posts || [])
      } catch (error) {
        console.error("Failed to fetch posts")
      }
    }
    fetchPosts()
  }

  if (!user) {
    return null
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Posts & Content</h1>
        <p className="text-muted-foreground mt-1">Create and manage your portfolio and work samples</p>
      </motion.div>

      {/* Verification Banner */}
      {!user.verified && (
        <motion.div
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">Account Not Verified</h3>
            <p className="text-sm text-yellow-800 mt-1">
              Your account is pending verification. Posts will be approved after your business is verified by our admin
              team.
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div className="grid md:grid-cols-4 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Posts</p>
          <p className="text-2xl font-bold mt-1">{posts.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="text-2xl font-bold mt-1 text-secondary">{approvedPosts.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Pending Review</p>
          <p className="text-2xl font-bold mt-1 text-yellow-600">{pendingPosts.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Hidden</p>
          <p className="text-2xl font-bold mt-1 text-orange-600">{hiddenPosts.length}</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        {/* Create Post Tab */}
        <TabsContent value="create" className="mt-6">
          <CreatePostForm
            providerId={user.id}
            providerName={`${user.firstName} ${user.lastName}`}
            businessName={user.businessId ? "Business" : ""}
            verified={user.verified}
            onSuccess={handlePostCreated}
          />
        </TabsContent>

        {/* All Posts Tab */}
        <TabsContent value="all" className="mt-6">
          <motion.div
            className="space-y-4"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            animate="visible"
          >
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 border border-border rounded-lg">
                <p className="text-muted-foreground">You haven't created any posts yet</p>
              </div>
            ) : (
              posts.map((post) => (
                <motion.div key={post.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <ProviderPostCard post={post} />
                </motion.div>
              ))
            )}
          </motion.div>
        </TabsContent>

        {/* Approved Posts Tab */}
        <TabsContent value="approved" className="mt-6">
          <motion.div
            className="space-y-4"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            animate="visible"
          >
            {approvedPosts.length === 0 ? (
              <div className="text-center py-12 border border-border rounded-lg">
                <p className="text-muted-foreground">No approved posts yet</p>
              </div>
            ) : (
              approvedPosts.map((post) => (
                <motion.div key={post.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <ProviderPostCard post={post} />
                </motion.div>
              ))
            )}
          </motion.div>
        </TabsContent>

        {/* Pending Posts Tab */}
        <TabsContent value="pending" className="mt-6">
          <motion.div
            className="space-y-4"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            animate="visible"
          >
            {pendingPosts.length === 0 ? (
              <div className="text-center py-12 border border-border rounded-lg">
                <p className="text-muted-foreground">No pending posts</p>
              </div>
            ) : (
              pendingPosts.map((post) => (
                <motion.div key={post.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <ProviderPostCard post={post} />
                </motion.div>
              ))
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
