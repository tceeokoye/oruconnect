'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FeedComponent } from '@/components/feed-component';
import axios from 'axios';

interface Post {
  _id: string;
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  content: string;
  images?: string[];
  videos?: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  createdAt: Date;
  interactionId?: string;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    fetchPosts();
    // Get current user ID from auth
    // setCurrentUserId(getCurrentUserId());
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/posts');
      setPosts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-900 pt-20 pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Provider <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Feed</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Discover amazing services and connect with top providers
          </p>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <motion.div
            className="flex items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading posts...</p>
            </div>
          </motion.div>
        ) : (
          <FeedComponent
            posts={posts}
            currentUserId={currentUserId}
            onPostDelete={(postId) => {
              setPosts(posts.filter((p) => p._id !== postId));
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
