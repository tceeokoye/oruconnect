"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import axios from "axios"

interface RateProviderDialogProps {
  jobRequestId: string
  providerId: string
  providerName: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function RateProviderDialog({
  jobRequestId,
  providerId,
  providerName,
  isOpen,
  onClose,
  onSuccess,
}: RateProviderDialogProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState("")
  const [communication, setCommunication] = useState(5)
  const [quality, setQuality] = useState(5)
  const [timeliness, setTimeliness] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating")
      return
    }

    setIsSubmitting(true)
    try {
      await axios.post("/api/jobs/rate", {
        jobRequestId,
        ratedUser: providerId,
        rating,
        review,
        communication,
        quality,
        timeliness,
      })
      toast.success("Rating submitted successfully!")
      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit rating")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card w-full max-w-lg rounded-xl shadow-xl overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold">Rate Your Experience</h2>
            <p className="text-sm text-muted-foreground mt-1">
              How was your experience working with {providerName}?
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Overall Rating */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <span className="text-sm font-medium">Overall Rating</span>
              <div className="flex gap-1 cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 transition-colors ${
                      (hoverRating || rating) >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground stroke-1"
                    }`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            {/* Sub-ratings */}
            <div className="space-y-4 pt-4 border-t border-border">
              {[
                { label: "Communication", value: communication, setter: setCommunication },
                { label: "Quality of Work", value: quality, setter: setQuality },
                { label: "Timeliness", value: timeliness, setter: setTimeliness },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm">{item.label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 cursor-pointer ${
                          item.value >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground stroke-1"
                        }`}
                        onClick={() => item.setter(star)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Written Review (Optional)</label>
              <Textarea
                placeholder="Share more details about your experience..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Rating
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
