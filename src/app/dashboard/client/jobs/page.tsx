"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, MessageCircle, FileText, CheckCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export default function ClientJobsPage() {
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  
  const fetchJobs = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/jobs/client")
      const data = await res.json()
      if (data.success) {
        setJobs(data.data || [])
      }
    } catch (error) {
      toast.error("Failed to load jobs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleAcceptProposal = async (proposalId: string) => {
    try {
      const res = await fetch(`/api/jobs/requests/accept-proposal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId })
      })

      const data = await res.json()
      if (res.ok) {
        toast.success("Proposal accepted! Job is now in progress.")
        fetchJobs()
      } else {
        toast.error(data.message || "Failed to accept proposal")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const handleCompleteJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId })
      })

      const data = await res.json()
      if (res.ok) {
        toast.success("Job completed and funds released to provider!")
        fetchJobs()
      } else {
        toast.error(data.message || "Failed to complete job")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const filteredJobs = jobs.filter((j) => filterStatus === "all" || j.status === filterStatus)

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="w-full px-4 py-12 space-y-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold">My Jobs</h1>
            <p className="text-muted-foreground mt-1">Track and manage all your service requests</p>
          </div>
          <Link
            href="/dashboard/client/post-job"
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Post New Job
          </Link>
        </motion.div>

        {/* Filters */}
        <motion.div className="flex gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {["all", "open", "in_progress", "completed", "closed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                filterStatus === status 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {status === "all" ? "All" : status.replace(/_/g, " ")}
            </button>
          ))}
        </motion.div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            animate="visible"
          >
            {filteredJobs.map((job) => {
              const statusColors: Record<string, string> = {
                open: "bg-yellow-500/10 text-yellow-600",
                accepted: "bg-blue-500/10 text-blue-600",
                in_progress: "bg-purple-500/10 text-purple-600",
                completed: "bg-green-500/10 text-green-600",
              }

              const hasProposals = job.proposals && job.proposals.length > 0;

              return (
                <motion.div
                  key={job._id}
                  whileHover={{ y: -4 }}
                  className="bg-card border border-border/50 rounded-2xl p-6 space-y-5 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Decorative glowing gradient behind card content */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative flex flex-col h-full z-10">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-xl group-hover:text-primary transition-colors">{job.title}</h3>
                        <span className="text-xs font-bold px-3 py-1 bg-primary/10 text-primary rounded-full">
                          {job.category}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{job.description}</p>

                      <div className="flex flex-wrap gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Original Budget</p>
                          <p className="font-medium">₦{job.budget?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Timeline</p>
                          <p className="font-medium">{job.timeline}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Posted Date</p>
                          <p className="font-medium">{new Date(job.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col items-end shrink-0 gap-2">
                      <div className={`text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${statusColors[job.status] || ""}`}>
                        {job.status.replace(/_/g, " ")}
                      </div>
                      {hasProposals && job.status === "open" && (
                        <div className="flex items-center gap-1.5 text-xs text-primary font-bold bg-primary/5 px-3 py-1.5 rounded-full">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                          {job.proposals.length} Proposal(s)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 relative z-10">
                    {job.status === "open" && (
                    <div className="border-t border-border pt-4">
                      <Button 
                        variant={hasProposals ? "default" : "outline"}
                        className="w-full justify-between"
                        disabled={!hasProposals}
                        onClick={() => setExpandedJobId(expandedJobId === job._id ? null : job._id)}
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {hasProposals ? `View Proposals (${job.proposals.length})` : "No Proposals Yet"}
                        </span>
                      </Button>

                      {expandedJobId === job._id && (
                        <div className="mt-4 space-y-3 pl-4 border-l-2 border-primary/20">
                          {job.proposals.map((proposal: any) => (
                            <div key={proposal._id} className="bg-muted rounded-md p-4 space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold text-sm">
                                    Provider: {proposal.provider?.firstName} {proposal.provider?.lastName}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    "{proposal.jobDescription}"
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-sm">₦{proposal.budget?.toLocaleString()}</p>
                                  <p className="text-xs text-muted-foreground">{proposal.timeframe}</p>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" size="sm" className="h-8">
                                  <MessageCircle className="w-3 h-3 mr-2" /> Message
                                </Button>
                                {proposal.status === "pending" && (
                                  <Button 
                                    size="sm" 
                                    className="h-8"
                                    onClick={() => handleAcceptProposal(proposal._id)}
                                  >
                                    <CheckCircle className="w-3 h-3 mr-2" /> Accept
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {job.status === "in_progress" && (
                    <div className="border-t border-border pt-4 flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                      <Button className="flex-1" onClick={() => handleCompleteJob(job._id)}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                    </div>
                  )}
                  </div>
                </motion.div>
              )
            })}

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No jobs found in this category.</p>
                <Link
                  href="/dashboard/client/post-job"
                  className="text-primary font-semibold hover:underline inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Post your first job
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
