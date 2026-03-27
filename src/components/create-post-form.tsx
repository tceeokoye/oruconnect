"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { createPostSchema, type CreatePostFormData } from "@/lib/validation/schemas"
import { Upload, ImageIcon, Video, FileText, Loader2, X } from "lucide-react"

interface CreatePostFormProps {
  providerId: string
  providerName: string
  businessName: string
  verified: boolean
  onSuccess?: () => void
}

export default function CreatePostForm({
  providerId,
  providerName,
  businessName,
  verified,
  onSuccess,
}: CreatePostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [postType, setPostType] = useState<"text" | "video" | "video_with_text">("text")
  const [mediaPreview, setMediaPreview] = useState<string>("")
  const [mediaFile, setMediaFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
  })

  const caption = watch("caption")

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (postType.includes("video")) {
      if (!["video/mp4", "video/webm", "video/quicktime"].includes(file.type)) {
        toast.error("Please upload a valid video file (MP4, WebM, or MOV)")
        return
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Video must be less than 50MB")
        return
      }
    }

    setMediaFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setMediaPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: CreatePostFormData) => {
    if ((postType === "video" || postType === "video_with_text") && !mediaFile) {
      toast.error("Please upload a video")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        providerId,
        providerName,
        businessName,
        verified,
        type: postType,
        caption: data.caption,
        mediaUrl: mediaPreview || data.mediaUrl || null,
        mediaThumbnail: mediaPreview ? mediaPreview : null,
      }

      const response = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message)
        reset()
        setMediaPreview("")
        setMediaFile(null)
        setPostType("text")
        onSuccess?.()
      } else {
        toast.error(result.message || "Failed to create post")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card border border-border rounded-xl p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <label className="block text-sm font-medium mb-3">What's on your mind?</label>
        <textarea
          placeholder="Share your latest project, work samples, or business updates..."
          {...register("caption")}
          rows={4}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background resize-none"
        />
        {errors.caption && <p className="text-destructive text-sm mt-2">{errors.caption.message}</p>}
        <p className="text-xs text-muted-foreground mt-2">{caption?.length || 0}/500 characters</p>
      </div>

      {/* Post Type Selection */}
      <div>
        <label className="block text-sm font-medium mb-3">Post Type</label>
        <div className="grid grid-cols-3 gap-3">
          <motion.button
            type="button"
            onClick={() => setPostType("text")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
              postType === "text" ? "border-primary bg-primary/5" : "border-border hover:border-primary"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs font-medium">Text Only</span>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setPostType("video")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
              postType === "video" ? "border-primary bg-primary/5" : "border-border hover:border-primary"
            }`}
          >
            <Video className="w-5 h-5" />
            <span className="text-xs font-medium">Video Only</span>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setPostType("video_with_text")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
              postType === "video_with_text" ? "border-primary bg-primary/5" : "border-border hover:border-primary"
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-xs font-medium">Video + Text</span>
          </motion.button>
        </div>
      </div>

      {/* Media Upload */}
      {(postType === "video" || postType === "video_with_text") && (
        <div>
          <label className="block text-sm font-medium mb-3">Upload Video</label>
          <div className="relative border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer group">
            <input
              type="file"
              accept="video/*"
              onChange={handleMediaChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {!mediaPreview ? (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                <div>
                  <p className="text-sm font-medium text-foreground">Click to upload or drag video</p>
                  <p className="text-xs text-muted-foreground">MP4, WebM, or MOV • Max 50MB</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <video src={mediaPreview} className="max-h-40 mx-auto rounded" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMediaPreview("")
                    setMediaFile(null)
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Publishing...
          </>
        ) : (
          "Publish Post"
        )}
      </button>
    </motion.form>
  )
}
