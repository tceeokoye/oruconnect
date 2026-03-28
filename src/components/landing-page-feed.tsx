"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ProviderPostCard from "@/components/provider-post-card";
import { ArrowRight, Loader2 } from "lucide-react";
import type { ProviderPost } from "@/types";

export default function LandingPageFeed() {
  const [posts, setPosts] = useState<ProviderPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts?limit=6");
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error("Failed to fetch posts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Framer Motion variants for staggered animation
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-16 px-4 md:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-foreground">
            Latest From Verified Providers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover work samples, project updates, and success stories from
            trusted service providers across Nigeria.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
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
        ) : posts.length === 0 ? (
          <div className="text-center py-12 border border-border rounded-xl bg-card">
            <p className="text-muted-foreground text-lg">No posts available yet</p>
            <p className="text-sm text-muted-foreground/60 mt-2">Publish your first portfolio post to appear here!</p>
          </div>
        ) : (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {posts.map((post) => (
              <motion.div
                key={post.id}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                whileHover={{
                  y: -4,
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
                className="group overflow-hidden rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300"
              >
                <ProviderPostCard post={post} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Link
            href="/feeds"
            className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            View All Feeds
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
