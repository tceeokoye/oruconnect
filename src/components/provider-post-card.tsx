"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Play, Badge } from "lucide-react";
import type { ProviderPost } from "@/types";
import CommentsDialog from "./comments-dialog";
import ShareModal from "./share-modal";

interface ProviderPostCardProps {
  post: ProviderPost;
  onLike?: () => void;
}

export default function ProviderPostCard({
  post,
  onLike,
}: ProviderPostCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [shareCount, setShareCount] = useState(post.shares);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.();
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all"
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
              {post.providerName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">
                  {post.providerName}
                </h4>
                {post.verified && (
                  <span title="Verified Provider">
                    <Badge className="w-4 h-4 flex items-center justify-center text-secondary p-0">
                      ✓
                    </Badge>
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {post.businessName}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Caption */}
        <div className="p-4">
          <p className="text-sm text-foreground leading-relaxed">
            {post.caption}
          </p>
        </div>

        {/* Media */}
        {post.mediaUrl && (
          <div
            className="relative bg-black/5 aspect-video overflow-hidden"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {post.type === "text" ? (
              <img
                src={post.mediaUrl || "/placeholder.svg"}
                alt="Post content"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <video
                  src={post.mediaUrl}
                  poster={post.mediaThumbnail}
                  className="w-full h-full object-cover"
                  muted
                />
                {isHovering && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-12 h-12 rounded-full bg-white flex items-center justify-center"
                    >
                      <Play className="w-5 h-5 text-black ml-0.5" />
                    </motion.div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="px-4 py-3 border-t border-border flex gap-4 text-muted-foreground">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            className="flex items-center gap-2 text-sm hover:text-primary transition-colors group"
          >
            <Heart
              className={`w-4 h-4 ${
                isLiked ? "fill-primary text-primary" : ""
              }`}
            />
            <span className="group-hover:text-primary">{post.likes}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowComments(true)}
            className="flex items-center gap-2 text-sm hover:text-primary transition-colors group"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="group-hover:text-primary">{commentCount}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowShare(true)}
            className="flex items-center gap-2 text-sm hover:text-primary transition-colors group"
          >
            <Share2 className="w-4 h-4" />
            <span className="group-hover:text-primary">{shareCount}</span>
          </motion.button>
        </div>
      </motion.div>

      <CommentsDialog
        postId={post.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        initialCommentCount={commentCount}
        onCommentAdded={(count) => setCommentCount(count)}
      />

      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        postId={post.id}
        onShare={() => setShareCount(shareCount + 1)}
      />
    </>
  );
}
