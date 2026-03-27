"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, Filter, MapPin, Star, Shield, ChevronDown, Loader2 } from "lucide-react"
import { NIGERIAN_STATES } from "@/lib/constants/nigerian-states"

const CATEGORIES = ["All", "Electrical", "Plumbing", "Carpentry", "Cleaning", "Design"]

export default function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedState, setSelectedState] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function fetchProviders() {
      try {
        const res = await fetch("/api/professionals")
        const json = await res.json()
        if (json.success) {
          setProviders(json.data)
        }
      } catch (error) {
        console.error("Failed to fetch professionals", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProviders()
  }, [])

  const filteredProviders = providers.filter((provider) => {
    const catName = provider.category?.name || "Uncategorized"
    const pName = provider.name || ""
    const matchesSearch =
      pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      catName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || catName === selectedCategory
    const matchesState = !selectedState || provider.state === selectedState
    const matchesCity = !selectedCity || provider.city === selectedCity

    return matchesSearch && matchesCategory && matchesState && matchesCity
  })

  const cities = selectedState ? NIGERIAN_STATES[selectedState] || [] : []

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
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <motion.div className="space-y-6 mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold">Find Service Providers</h1>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, service, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
          />
        </div>
      </motion.div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <motion.div
          className={`${showFilters ? "block" : "hidden"} md:block md:w-64 space-y-6 pb-6 md:pb-0`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Category Filter */}
          <div className="space-y-3">
            <h3 className="font-semibold">Category</h3>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={selectedCategory === cat}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* State Filter */}
          <div className="space-y-3">
            <h3 className="font-semibold">State</h3>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value)
                setSelectedCity("")
              }}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-sm"
            >
              <option value="">All States</option>
              {Object.keys(NIGERIAN_STATES).map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          {selectedState && (
            <div className="space-y-3">
              <h3 className="font-semibold">City</h3>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-sm"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Active Filters */}
          {(selectedState || selectedCategory !== "All") && (
            <button
              onClick={() => {
                setSelectedCategory("All")
                setSelectedState("")
                setSelectedCity("")
              }}
              className="w-full px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Clear Filters
            </button>
          )}
        </motion.div>

        {/* Providers Grid */}
        <div className="flex-1">
          {/* Mobile Filter Toggle */}
          <div className="md:hidden mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full px-4 py-2 border border-border rounded-lg flex items-center justify-between hover:bg-muted transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Results Count */}
          {!loading && (
            <p className="text-sm text-muted-foreground mb-6">
              Showing {filteredProviders.length} provider{filteredProviders.length !== 1 ? "s" : ""}
            </p>
          )}

          {/* Providers Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground font-medium animate-pulse">Fetching trusted professionals...</p>
            </div>
          ) : (
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
            {filteredProviders.length > 0 ? (
              filteredProviders.map((provider) => (
                <motion.div
                  key={provider.id}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="group overflow-hidden rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300"
                >
                  <div className="h-48 bg-gradient-to-br from-muted to-muted/50 overflow-hidden relative">
                    <img
                      src={provider.image || "/placeholder.svg"}
                      alt={provider.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {provider.verified && (
                      <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                        <Shield className="w-3 h-3 text-white" />
                        <span className="text-xs font-semibold text-white">Verified</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold line-clamp-1">{provider.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {provider.category?.name || "Uncategorized"} {provider.subcategory ? `• ${provider.subcategory}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {provider.city}, {provider.state}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(provider.rating) ? "fill-accent text-accent" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold">{provider.rating}</span>
                      <span className="text-xs text-muted-foreground">({provider.reviews})</span>
                    </div>

                    <Link
                      href={`/providers/${provider.id}`}
                      className="block text-center py-2 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground mb-4">No providers found matching your criteria</p>
                <button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("All")
                    setSelectedState("")
                    setSelectedCity("")
                  }}
                  className="px-4 py-2 text-primary font-semibold hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
