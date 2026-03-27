"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Zap, Droplets, Hammer, Sparkles, Code, Palette, ChevronRight } from "lucide-react"

const CATEGORIES = [
  {
    id: "1",
    name: "Electrical",
    description: "Installation, repair, and maintenance services",
    icon: Zap,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    jobs: 1250,
  },
  {
    id: "2",
    name: "Plumbing",
    description: "Water systems and fixture services",
    icon: Droplets,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    jobs: 980,
  },
  {
    id: "3",
    name: "Carpentry",
    description: "Custom furniture and renovation",
    icon: Hammer,
    color: "text-amber-600",
    bgColor: "bg-amber-600/10",
    jobs: 756,
  },
  {
    id: "4",
    name: "Cleaning",
    description: "Commercial and residential cleaning",
    icon: Sparkles,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    jobs: 2100,
  },
  {
    id: "5",
    name: "IT Consulting",
    description: "Software and tech solutions",
    icon: Code,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    jobs: 1450,
  },
  {
    id: "6",
    name: "Design",
    description: "Interior, graphic, and web design",
    icon: Palette,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    jobs: 890,
  },
]

export default function CategoriesPage() {
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
        <h1 className="text-4xl font-bold">Service Categories</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Browse our comprehensive range of verified service categories across Nigeria
        </p>
      </motion.div>

      {/* Categories Grid */}
      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {CATEGORIES.map((category) => {
          const Icon = category.icon
          return (
            <motion.div
              key={category.id}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="group overflow-hidden rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300"
            >
              <Link href={`/providers?category=${category.name}`}>
                <div className={`${category.bgColor} p-6 space-y-4`}>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-lg bg-background/50 flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${category.color}`} />
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-current border-opacity-10">
                    <p className="text-xs font-semibold text-muted-foreground">{category.jobs} jobs posted</p>
                    <span className="text-xs font-bold text-primary group-hover:underline">Explore</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Stats */}
      <motion.div
        className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8 text-center space-y-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl font-bold">Discover Amazing Services</h2>
        <p className="text-muted-foreground">Join thousands of satisfied customers finding trusted professionals</p>
        <Link
          href="/providers"
          className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Start Browsing
        </Link>
      </motion.div>
    </div>
  )
}
