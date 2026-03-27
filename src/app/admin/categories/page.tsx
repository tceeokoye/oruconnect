"use client"

import { motion } from "framer-motion"
import { FileText, Plus, Edit2, Trash2 } from "lucide-react"
import { useState } from "react"

export default function CategoriesPage() {
  const [showModal, setShowModal] = useState(false)

  const categories = [
    {
      id: "1",
      name: "Electrical",
      description: "Electrical installation and repair services",
      subcategories: ["Installation & Repair", "Maintenance", "Solar Setup"],
      providers: 248,
    },
    {
      id: "2",
      name: "Plumbing",
      description: "Professional plumbing services",
      subcategories: ["Installation", "Repair", "Maintenance"],
      providers: 156,
    },
    {
      id: "3",
      name: "Interior Design",
      description: "Interior design and decoration services",
      subcategories: ["Design Consultation", "Implementation", "Renovation"],
      providers: 89,
    },
    {
      id: "4",
      name: "Cleaning",
      description: "Professional cleaning and janitorial services",
      subcategories: ["Residential", "Commercial", "Specialized"],
      providers: 342,
    },
  ]

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

      <div className="grid gap-6">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            className="bg-card border border-border rounded-lg p-6"
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
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">Subcategories:</p>
                  <div className="flex flex-wrap gap-2">
                    {category.subcategories.map((sub) => (
                      <span
                        key={sub}
                        className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-semibold"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{category.providers} providers in this category</p>
              </div>

              <div className="flex gap-2">
                <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4 text-primary" />
                </button>
                <button className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
