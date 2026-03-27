"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Copy, Share2, Check } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  postId: string
  onShare?: () => void
}

export default function ShareModal({ isOpen, onClose, postId, onShare }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  const postUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/post/${postId}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
      onShare?.()
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const shareOptions = [
    {
      id: "copy",
      label: "Copy Link",
      icon: Copy,
      action: handleCopyLink,
    },
    {
      id: "whatsapp",
      label: "Share on WhatsApp",
      icon: Share2,
      action: () => {
        const text = `Check out this post: ${postUrl}`
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
        onShare?.()
      },
    },
    {
      id: "twitter",
      label: "Share on X (Twitter)",
      icon: Share2,
      action: () => {
        const text = "Check out this amazing post on OruConnect!"
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`,
          "_blank",
        )
        onShare?.()
      },
    },
    {
      id: "facebook",
      label: "Share on Facebook",
      icon: Share2,
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, "_blank")
        onShare?.()
      },
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border border-border rounded-xl shadow-2xl z-50 w-full max-w-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold">Share this post</h2>
              <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Share Options */}
            <div className="p-6 space-y-3">
              {shareOptions.map((option) => {
                const Icon = option.icon
                return (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={option.action}
                    className="w-full flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      {option.id === "copy" && copied ? (
                        <Check className="w-5 h-5 text-primary" />
                      ) : (
                        <Icon className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <span className="font-medium">{option.label}</span>
                  </motion.button>
                )
              })}
            </div>

            {/* Link Preview */}
            <div className="px-6 pb-6 pt-0 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Post Link:</p>
              <div className="bg-muted/50 rounded-lg p-3 break-all text-xs font-mono text-foreground">{postUrl}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
