'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreVertical, Send } from 'lucide-react';
import axios from 'axios';

interface FeedPost {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  caption: string;
  mediaUrl?: string;
  mediaType?: string;
  type?: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  createdAt: Date;
  interactionId?: string;
}

interface FeedInteractionComponentProps {
  posts: FeedPost[];
  currentUserId: string;
  onPostDelete?: (postId: string) => void;
}

export function FeedComponent({
  posts = [],
  currentUserId,
  onPostDelete,
}: FeedInteractionComponentProps) {
  const [likeHeart, setLikeHeart] = useState<{ [key: string]: boolean }>({});
  const [likes, setLikes] = useState<{ [key: string]: number }>({});
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Initialize like state
    const initialLikes: { [key: string]: number } = {};
    const initialLikeHeart: { [key: string]: boolean } = {};

    posts.forEach((post) => {
      // Handle either 'id' or '_id' fallback
      const postId = post.id || (post as any)._id;
      initialLikes[postId] = post.likes;
      initialLikeHeart[postId] = post.isLiked || false;
    });

    setLikes(initialLikes);
    setLikeHeart(initialLikeHeart);
  }, [posts]);

  const handleLike = async (postId: string) => {
    const isLiked = likeHeart[postId];
    const newLikeState = !isLiked;

    setLikeHeart((prev) => ({ ...prev, [postId]: newLikeState }));
    setLikes((prev) => ({
      ...prev,
      [postId]: newLikeState ? (prev[postId] || 0) + 1 : Math.max(0, (prev[postId] || 0) - 1),
    }));

    try {
      await axios.post('/api/posts/like', {
        postId,
        userId: currentUserId,
        action: newLikeState ? 'like' : 'unlike',
      });
    } catch (error) {
      console.error('Failed to update like:', error);
      setLikeHeart((prev) => ({ ...prev, [postId]: isLiked }));
      setLikes((prev) => ({
        ...prev,
        [postId]: isLiked ? (prev[postId] || 0) + 1 : Math.max(0, (prev[postId] || 0) - 1),
      }));
    }
  };

  const handleShare = async (postId: string) => {
    try {
      await axios.post('/api/posts/share', {
        postId,
        userId: currentUserId,
      });

      // Copy shareable link to clipboard
      const shareUrl = `${window.location.origin}/posts/${postId}`;
      navigator.clipboard.writeText(shareUrl);

      // Show notification
      alert('Post link copied to clipboard!');
    } catch (error) {
      console.error('Failed to share post:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    const comment = newComments[postId];
    if (!comment?.trim()) return;

    try {
      await axios.post('/api/posts/comment', {
        postId,
        userId: currentUserId,
        content: comment,
      });

      setNewComments((prev) => ({
        ...prev,
        [postId]: '',
      }));

      // Refresh comments would go here
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  return (
    <motion.div
      className="space-y-6 w-full max-w-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence>
        {posts.map((post, index) => {
          const postId = post.id || (post as any)._id;
          
          return (
          <motion.div
            key={postId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
          >
            {/* Post Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center font-bold text-white shadow-inner"
                  whileHover={{ scale: 1.1 }}
                >
                  {post.providerName ? post.providerName.charAt(0).toUpperCase() : "P"}
                </motion.div>
                <div>
                  <h4 className="text-white font-semibold">{post.providerName || "Verified Provider"}</h4>
                  <p className="text-gray-400 text-sm">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/50 transition-colors"
              >
                <MoreVertical size={20} />
              </motion.button>
            </div>

            {/* Post Content */}
            <div className="p-4">
              <p className="text-gray-100 mb-4 whitespace-pre-wrap leading-relaxed">{post.caption}</p>

              {/* Single Unified Media View */}
              {post.mediaUrl && (
                <div className="mb-4 rounded-lg overflow-hidden bg-black/20">
                  {post.type === "text" || !post.mediaUrl?.includes(".mp4") && !post.mediaUrl?.includes(".webm") ? (
                    <motion.img
                      src={post.mediaUrl}
                      alt="Post attachment"
                      className="w-full h-auto max-h-96 object-contain"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    />
                  ) : (
                    <motion.video
                      src={post.mediaUrl}
                      controls
                      controlsList="nodownload"
                      className="w-full h-auto max-h-96 object-contain"
                      whileHover={{ scale: 1.01 }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Post Stats */}
            <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-400 border-b border-gray-700">
              <div className="flex space-x-4">
                <motion.span
                  className="cursor-pointer flex items-center space-x-1 hover:text-purple-400 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  <Heart size={16} fill={likeHeart[postId] ? 'currentColor' : 'none'} />
                  <span>{likes[postId] || 0} likes</span>
                </motion.span>
                <span className="flex items-center space-x-1">
                  <MessageCircle size={16} />
                  <span>{post.comments} comments</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Share2 size={16} />
                  <span>{post.shares} shares</span>
                </span>
              </div>
            </div>

            {/* Interaction Buttons */}
            <div className="px-4 py-3 flex items-center justify-around border-b border-gray-700">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLike(postId)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  likeHeart[postId]
                    ? 'text-red-500 bg-red-500/10'
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
                }`}
              >
                <Heart size={18} fill={likeHeart[postId] ? 'currentColor' : 'none'} />
                <span className="text-sm font-semibold">Like</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const newSet = new Set(expandedComments);
                  newSet.has(postId) ? newSet.delete(postId) : newSet.add(postId);
                  setExpandedComments(newSet);
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
              >
                <MessageCircle size={18} />
                <span className="text-sm font-semibold">Comment</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShare(postId)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-500/10 transition-colors"
              >
                <Share2 size={18} />
                <span className="text-sm font-semibold">Share</span>
              </motion.button>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
              {expandedComments.has(postId) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 py-4 border-t border-gray-700 space-y-3"
                >
                  {/* Comment Input */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newComments[postId] || ''}
                      onChange={(e) =>
                        setNewComments((prev) => ({
                          ...prev,
                          [postId]: e.target.value,
                        }))
                      }
                      placeholder="Write a comment..."
                      className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddComment(postId)}
                      className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Send size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          );
        })}
      </AnimatePresence>

      {posts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-gray-400"
        >
          <p>No posts yet. Start following providers to see their content!</p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default FeedComponent;
