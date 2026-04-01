"use client"

import { motion } from "framer-motion"
import { FileText, Plus, Edit2, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { CreateCategoryDialog } from "@/components/admin/categories/create-category-dialog"

export default function CategoriesPage() {
  const [showModal, setShowModal] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories")
        const data = await res.json()
        if (data.success) {
          setCategories(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch categories")
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  return (
    <div className="p-6 space-y-8">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold">Categories & Subcategories</h1>
          <p className="text-muted-foreground mt-1">Manage service categories on the platform</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </motion.div>

      {loading ? (
        <div className="grid gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 rounded-lg bg-card border border-border animate-pulse"></div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-lg">
          No categories found. Click "Add Category" to create one.
        </div>
      ) : (
        <div className="grid gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{category.description || "No description provided"}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground/80">Platform Statistics:</p>
                    <div className="flex flex-wrap gap-4">
                      <div className="px-3 py-1 bg-secondary/10 text-secondary rounded-lg text-xs font-semibold">
                        {category.professionals} Professionals
                      </div>
                      <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold">
                        {category.jobs} Active Jobs
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors group">
                    <Edit2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                  <button className="p-2 hover:bg-destructive/10 rounded-lg transition-colors group">
                    <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <CreateCategoryDialog
        open={showModal}
        onOpenChange={setShowModal}
        onSuccess={() => {
          // Re-fetch categories
          window.location.reload() // Or implement a proper state refresh
        }}
      />
    </div>
  )
}
