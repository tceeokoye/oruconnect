"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import type { RootState } from "@/store"
import { Zap, Droplets, Hammer, Sparkles, Code, Palette, ChevronRight, Home, Briefcase } from "lucide-react"

const IconMap: Record<string, any> = {
  Zap,
  Droplets,
  Hammer,
  Sparkles,
  Code,
  Palette,
  Home,
  Briefcase
}

export default function CategoriesPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const isProvider = user?.role === "PROFESSIONAL";
  const basePath = isProvider ? "/dashboard/provider/explore" : "/providers";

  if (!mounted) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      {/* Header */}
      <motion.div className="text-center space-y-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold">{isProvider ? "Job Opportunities" : "Service Categories"}</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {isProvider 
            ? "Browse open jobs from clients across Nigeria and grow your business" 
            : "Connect with the best professionals for your home and office needs across Nigeria"}
        </p>
      </motion.div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-card border border-border animate-pulse flex flex-col p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-muted"></div>
              <div className="h-6 w-1/2 bg-muted rounded"></div>
              <div className="h-4 w-full bg-muted rounded"></div>
              <div className="mt-auto pt-4 border-t border-border flex justify-between">
                <div className="h-4 w-20 bg-muted rounded"></div>
                <div className="h-4 w-12 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No categories found.
        </div>
      ) : (
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {categories.map((category) => {
            const Icon = IconMap[category.icon] || Briefcase
            const displayDescription = isProvider 
              ? `Find ${category.name.toLowerCase()} jobs, installation and maintenance projects`
              : category.description || `Verified ${category.name.toLowerCase()} services and experts`;

            return (
              <motion.div
                key={category.id}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="group overflow-hidden rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300"
              >
                <Link href={`${basePath}?category=${category.name}`}>
                  <div className={`${category.bgColor || "bg-primary/5"} p-6 space-y-4`}>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-lg bg-background/50 flex items-center justify-center">
                        <Icon className={`w-6 h-6 ${category.color || "text-primary"}`} />
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{displayDescription}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-current border-opacity-10">
                      <p className="text-xs font-semibold text-muted-foreground">
                        {isProvider ? `${category.jobs} jobs available` : `${category.professionals}+ professionals`}
                      </p>
                      <span className="text-xs font-bold text-primary group-hover:underline">
                        {isProvider ? "Find Jobs" : "Find Pros"}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      <motion.div
        className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8 text-center space-y-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl font-bold">{isProvider ? "Ready to find your next gig?" : "Can't find what you're looking for?"}</h2>
        <p className="text-muted-foreground">
          {isProvider 
            ? "There are thousands of clients waiting for your expertise." 
            : "Our support team is here to help you find the right professional for your needs."}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={isProvider ? "/dashboard/provider/explore" : "/dashboard/client/post-job"}
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            {isProvider ? "Explore Marketplace" : "Post a Job"}
          </Link>
          {!isProvider && (
            <Link
              href="/contact"
              className="inline-block px-6 py-3 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
            >
              Contact Support
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  )
}
