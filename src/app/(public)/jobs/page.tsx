"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Search, MapPin, Briefcase, Calendar, Filter, X, ChevronRight, Loader2, ArrowRight } from "lucide-react"
import { NIGERIAN_STATES } from "@/lib/constants/nigerian-states"

const JOB_CATEGORIES = [
  "IT & Development",
  "Cleaning Services",
  "Legal Services",
  "Home Maintenance",
  "Electrical",
  "Plumbing",
  "Design & Creative",
  "Writing & Content",
  "Marketing & Sales",
  "Accounting",
]

export default function JobsPage() {
  const user = useSelector((state: RootState) => state.auth.user)
  const router = useRouter()

  useEffect(() => {
    if (user?.role === "USER") {
      router.replace("/providers")
    }
  }, [user, router])

  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedState, setSelectedState] = useState("All")
  const [selectedCity, setSelectedCity] = useState("All")
  const [showFilters, setShowFilters] = useState(false)

  // Complete city list extraction based on state
  const cities = selectedState !== "All" ? NIGERIAN_STATES[selectedState] || [] : []

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (selectedCategory !== "All") params.append("category", selectedCategory)
        if (selectedState !== "All") params.append("state", selectedState)
        if (selectedCity !== "All") params.append("city", selectedCity)
        if (searchTerm) params.append("search", searchTerm)

        const response = await fetch(`/api/jobs?status=open&${params.toString()}`)
        const data = await response.json()
        if (data.success) {
          setJobs(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [searchTerm, selectedCategory, selectedState, selectedCity])

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary py-12 md:py-20 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-6"
          >
            Find Your Next <br />
            <span className="text-secondary">Project Opportunity</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-primary-foreground/80 text-xl max-w-2xl mx-auto mb-10"
          >
            Browse thousands of active jobs from verified clients across Nigeria.
          </motion.p>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto bg-white rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-2xl"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search jobs by title or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-none text-gray-900 font-medium focus:ring-0 rounded-xl"
              />
            </div>
            <button
               onClick={() => setShowFilters(!showFilters)}
               className="px-6 py-4 bg-muted text-foreground rounded-xl flex items-center justify-center gap-2 hover:bg-muted/80 transition-all font-bold md:w-auto"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
            <button className="px-10 py-4 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/90 transition-all active:scale-95 md:w-auto shadow-lg shadow-secondary/20">
              Search
            </button>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-72 space-y-8">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6 sticky top-28">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-4">Category</h3>
                <div className="space-y-2">
                  {["All", ...JOB_CATEGORIES].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedCategory === cat ? "bg-primary text-white font-bold" : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-4">Location</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold">State</label>
                    <select
                      value={selectedState}
                      onChange={(e) => {
                        setSelectedState(e.target.value)
                        setSelectedCity("All")
                      }}
                      className="w-full bg-muted border-none rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary"
                    >
                      <option value="All">All States</option>
                      {Object.keys(NIGERIAN_STATES).map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  {selectedState !== "All" && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold">City/Area</label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full bg-muted border-none rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary"
                      >
                        <option value="All">All Cities</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Jobs List Area */}
          <main className="flex-1 space-y-8">
            {/* Mobile Filters Trigger Overlay */}
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-50 lg:hidden flex items-end"
                  onClick={() => setShowFilters(false)}
                >
                   <motion.div 
                     initial={{ y: "100%" }}
                     animate={{ y: 0 }}
                     exit={{ y: "100%" }}
                     className="bg-card w-full h-[80vh] rounded-t-[3rem] p-8 flex flex-col gap-8"
                     onClick={(e) => e.stopPropagation()}
                   >
                     <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black">Search Filters</h2>
                        <button onClick={() => setShowFilters(false)}>
                           <X className="w-8 h-8" />
                        </button>
                     </div>
                     <div className="flex-1 overflow-y-auto space-y-8 pr-2">
                        <div className="space-y-4">
                           <h3 className="font-black text-sm uppercase">Category</h3>
                           <div className="flex flex-wrap gap-2">
                              {["All", ...JOB_CATEGORIES].map(cat => (
                                <button 
                                  key={cat}
                                  onClick={() => setSelectedCategory(cat)}
                                  className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                                    selectedCategory === cat ? "bg-primary text-white border-primary" : "border-border text-muted-foreground"
                                  }`}
                                >
                                  {cat}
                                </button>
                              ))}
                           </div>
                        </div>

                        <div className="space-y-4">
                           <h3 className="font-black text-sm uppercase">Location</h3>
                           <select 
                              value={selectedState}
                              onChange={e => {
                                setSelectedState(e.target.value)
                                setSelectedCity("All")
                              }}
                              className="w-full bg-muted p-4 rounded-xl text-lg font-bold"
                           >
                             <option value="All">All States</option>
                             {Object.keys(NIGERIAN_STATES).map(s => <option key={s} value={s}>{s}</option>)}
                           </select>

                           {selectedState !== "All" && (
                             <select 
                                value={selectedCity}
                                onChange={e => setSelectedCity(e.target.value)}
                                className="w-full bg-muted p-4 rounded-xl text-lg font-bold"
                             >
                                <option value="All">All Cities</option>
                                {cities.map(c => <option key={c} value={c}>{c}</option>)}
                             </select>
                           )}
                        </div>
                     </div>
                     <button 
                        onClick={() => setShowFilters(false)}
                        className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
                     >
                        Apply Filters
                     </button>
                   </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black tracking-tight">
                {loading ? "Discovering Jobs..." : `${jobs.length} Found Opportunity`}
              </h2>
              {/* Desktop Filters Clear */}
              {(selectedCategory !== "All" || selectedState !== "All" || selectedCity !== "All" || searchTerm) && (
                <button 
                  onClick={() => {
                    setSelectedCategory("All")
                    setSelectedState("All")
                    setSelectedCity("All")
                    setSearchTerm("")
                  }}
                  className="text-primary text-sm font-bold hover:underline"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="font-bold text-muted-foreground animate-pulse text-lg italic">Searching the Nigeria marketplace...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-24 bg-muted/30 rounded-3xl border border-dashed border-border">
                <Briefcase className="w-20 h-20 text-muted-foreground/30 mx-auto mb-6" />
                <h3 className="text-2xl font-black mb-2">No jobs matched your search</h3>
                <p className="text-muted-foreground max-w-sm mx-auto font-medium">Try broadening your criteria or checking back soon as new jobs are posted daily.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {jobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                    className="group flex flex-col md:flex-row bg-card border border-border rounded-2xl p-6 md:p-8 hover:border-primary transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/5"
                  >
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-black rounded-full uppercase tracking-widest">
                          {job.category}
                        </span>
                        {job.client?.verified && (
                          <span className="flex items-center gap-1 text-[10px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-bold">
                            Verified Client
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-2xl md:text-3xl font-black tracking-tight group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      
                      <p className="text-muted-foreground line-clamp-2 text-lg font-medium">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-6 text-sm font-semibold text-muted-foreground pt-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          Posted {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-foreground font-black text-base">
                          ₦{job.budget?.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 md:mt-0 md:ml-8 flex items-center justify-end">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="group/btn flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-xl font-black text-lg hover:bg-primary/90 transition-all hover:shadow-xl hover:shadow-primary/20 active:scale-95"
                      >
                        Details
                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
