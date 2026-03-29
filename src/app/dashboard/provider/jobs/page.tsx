"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import { Search, Briefcase, Calendar, MapPin, Loader2, MessageCircle } from "lucide-react"
import type { RootState } from "@/store"
import { useRouter } from "next/navigation"

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-yellow-500/10", text: "text-yellow-600" },
  in_progress: { bg: "bg-blue-500/10", text: "text-blue-600" },
  completed: { bg: "bg-green-500/10", text: "text-green-600" },
  cancelled: { bg: "bg-red-500/10", text: "text-red-600" },
  disputed: { bg: "bg-red-500/10", text: "text-red-600" },
}

export default function JobsPage() {
  const token = useSelector((state: RootState) => state.auth.token)
  const router = useRouter()
  
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/provider/jobs", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success && data.data) {
          setJobs(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch jobs", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (token) fetchJobs()
  }, [token])

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = filterStatus === "all" || job.status === filterStatus
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Your Jobs</h1>
        <p className="text-muted-foreground mt-1">Manage and track all your active and past jobs</p>
      </motion.div>

      {/* Search & Filter */}
      <motion.div className="flex gap-4 flex-col md:flex-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "in_progress", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                filterStatus === status ? "bg-primary text-white" : "border border-border hover:border-primary"
              }`}
            >
              {status === "all" ? "All" : status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Jobs List */}
      <motion.div
        className="space-y-4 relative min-h-[300px]"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="visible"
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-lg">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-foreground">No jobs found</p>
            <p className="text-muted-foreground mt-1 text-sm">You do not have any jobs matching this criteria.</p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const colors = STATUS_COLORS[job.status] || STATUS_COLORS.pending
            return (
              <motion.div
                key={job.id}
                whileHover={{ x: 4 }}
                className="bg-card border border-border rounded-lg p-6 space-y-4 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{job.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{job.description}</p>

                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="w-4 h-4" />
                        {job.client}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(job.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-xl">₦{Number(job.budget || 0).toLocaleString()}</p>
                      <div className="flex justify-end mt-2">
                        <p className={`text-xs font-bold px-3 py-1 rounded-full ${colors.bg} ${colors.text} inline-flex`}>
                          {job.status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4 flex gap-2">
                  <button 
                    onClick={() => router.push('/dashboard/provider/messages')}
                    className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" /> Message Client
                  </button>
                  {job.status === "pending" && (
                     <>
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/provider/jobs/${job.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ action: 'accept', type: job.type })
                              });
                              if (res.ok) router.push('/dashboard/provider/messages');
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                          Accept
                        </button>
                        <button
                           onClick={async () => {
                             try {
                               const res = await fetch(`/api/provider/jobs/${job.id}`, {
                                 method: 'PATCH',
                                 headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                 body: JSON.stringify({ action: 'decline', type: job.type })
                               });
                               if (res.ok) window.location.reload();
                             } catch (e) {
                               console.error(e);
                             }
                           }}
                           className="flex-1 px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                        >
                          Decline
                        </button>
                     </>
                  )}
                  {job.status === "in_progress" && (
                    <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/provider/jobs/${job.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ action: 'complete', type: job.type })
                            });
                            if (res.ok) window.location.reload();
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })
        )}
      </motion.div>
    </div>
  )
}
