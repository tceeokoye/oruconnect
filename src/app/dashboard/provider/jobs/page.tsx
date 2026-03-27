"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Briefcase, Calendar, MapPin } from "lucide-react"

const JOBS = [
  {
    id: "1",
    title: "Electrical Rewiring - 3BR House",
    client: "John Doe",
    status: "in_progress",
    budget: 45000,
    dueDate: "2026-01-15",
    description: "Complete rewiring of a 3-bedroom house",
    location: "Lagos, Nigeria",
  },
  {
    id: "2",
    title: "Solar Panel Installation",
    client: "Jane Smith",
    status: "pending",
    budget: 320000,
    dueDate: "2026-01-20",
    description: "Install 10kW solar panel system",
    location: "Abuja, Nigeria",
  },
  {
    id: "3",
    title: "Emergency Light Repair",
    client: "Tech Company Ltd",
    status: "in_progress",
    budget: 12000,
    dueDate: "2026-01-10",
    description: "Fix emergency lighting system",
    location: "Lagos, Nigeria",
  },
  {
    id: "4",
    title: "Monthly Maintenance",
    client: "Office Complex",
    status: "completed",
    budget: 8500,
    dueDate: "2026-01-05",
    description: "Routine electrical maintenance",
    location: "Lagos, Nigeria",
  },
]

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-yellow-500/10", text: "text-yellow-600" },
  in_progress: { bg: "bg-blue-500/10", text: "text-blue-600" },
  completed: { bg: "bg-green-500/10", text: "text-green-600" },
  disputed: { bg: "bg-red-500/10", text: "text-red-600" },
}

export default function JobsPage() {
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredJobs = JOBS.filter((job) => {
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

        <div className="flex gap-2">
          {["all", "pending", "in_progress", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === status ? "bg-primary text-white" : "border border-border hover:border-primary"
              }`}
            >
              {status === "all" ? "All" : status.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Jobs List */}
      <motion.div
        className="space-y-4"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="visible"
      >
        {filteredJobs.map((job) => {
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
                      {new Date(job.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-xl">₦{job.budget.toLocaleString()}</p>
                    <p className={`text-xs font-semibold px-3 py-1 rounded-full ${colors.bg} ${colors.text} mt-2`}>
                      {job.status.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex gap-2">
                <button className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium">
                  View Details
                </button>
                {job.status === "in_progress" && (
                  <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                    Mark Complete
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No jobs found</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
