"use client"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Search, MapPin, Calendar, Clock, DollarSign, Send } from "lucide-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { Hover3DCard } from "@/components/ui/3d-hover-card"

const proposalSchema = z.object({
  jobDescription: z.string().min(20, "Proposal must be at least 20 characters"),
  timeframe: z.string().min(1, "Timeframe is required"),
  budget: z.string().min(1, "Budget is required"),
})

export default function ExploreJobsPage() {
  return (
    <Suspense fallback={<div className="p-6 space-y-6 max-w-6xl mx-auto animate-pulse">
      <div className="h-10 w-48 bg-muted rounded"></div>
      <div className="h-4 w-64 bg-muted rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-muted rounded-xl"></div>
        ))}
      </div>
    </div>}>
      <ExploreJobsContent />
    </Suspense>
  )
}

function ExploreJobsContent() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [budgetRange, setBudgetRange] = useState("all")
  const [datePosted, setDatePosted] = useState("all")
  const [selectedJob, setSelectedJob] = useState<any | null>(null)

  const fetchOpenJobs = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/jobs?status=open")
      const data = await res.json()
      if (data.success) {
        setJobs(data.data || [])
      }
    } catch (error) {
      toast.error("Failed to load marketplace jobs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOpenJobs()
  }, [])

  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get("category")

  useEffect(() => {
    if (categoryFromUrl) {
      setFilterCategory(categoryFromUrl)
    }
  }, [categoryFromUrl])

  const filteredJobs = jobs.filter((job) => {
    // text search
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    // category filter
    const matchesCategory = filterCategory === "all" || job.category === filterCategory

    // budget filter
    let matchesBudget = true
    if (budgetRange !== "all" && job.budget) {
      if (budgetRange === "under_50k") matchesBudget = job.budget < 50000
      if (budgetRange === "50k_200k") matchesBudget = job.budget >= 50000 && job.budget <= 200000
      if (budgetRange === "over_200k") matchesBudget = job.budget > 200000
    }

    // date filter
    let matchesDate = true
    if (datePosted !== "all") {
      const jobDate = new Date(job.createdAt)
      const now = new Date()
      const diffDays = (now.getTime() - jobDate.getTime()) / (1000 * 3600 * 24)
      if (datePosted === "today") matchesDate = diffDays <= 1
      if (datePosted === "this_week") matchesDate = diffDays <= 7
      if (datePosted === "this_month") matchesDate = diffDays <= 30
    }

    return matchesSearch && matchesCategory && matchesBudget && matchesDate
  })

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Explore Jobs</h1>
        <p className="text-muted-foreground mt-1">Browse open jobs from clients and submit your proposals</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search for jobs by title or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 outline-none"
          >
            <option value="all">Categories</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Carpentry">Carpentry</option>
            <option value="Cleaning">Cleaning</option>
          </select>

          <select 
            value={budgetRange} 
            onChange={(e) => setBudgetRange(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 outline-none"
          >
            <option value="all">Any Budget</option>
            <option value="under_50k">Under ₦50,000</option>
            <option value="50k_200k">₦50,000 - ₦200,000</option>
            <option value="over_200k">₦200,000+</option>
          </select>

          <select 
            value={datePosted} 
            onChange={(e) => setDatePosted(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 outline-none"
          >
            <option value="all">Any Date</option>
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No open jobs found. Check back later!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <Hover3DCard key={job._id}>
              <motion.div
                className="bg-card w-full h-full border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4 cursor-default"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg line-clamp-2">{job.title}</h3>
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap">
                      {job.category}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2 line-clamp-3">
                    {job.description}
                  </p>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium text-foreground">
                      Budget: ₦{job.budget?.toLocaleString() || "Negotiable"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Timeline: {job.timeline || "Flexible"}</span>
                  </div>
                  {job.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <Button onClick={() => setSelectedJob(job)} className="w-full gap-2 relative z-10">
                  <Send className="w-4 h-4" />
                  Submit Proposal
                </Button>
              </motion.div>
            </Hover3DCard>
          ))}
        </div>
      )}

      {selectedJob && (
        <SubmitProposalDialog
          job={selectedJob}
          open={!!selectedJob}
          onOpenChange={(isOpen) => !isOpen && setSelectedJob(null)}
          onSuccess={() => {
            setSelectedJob(null)
            fetchOpenJobs()
          }}
        />
      )}
    </div>
  )
}

function SubmitProposalDialog({ job, open, onOpenChange, onSuccess }: any) {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<z.infer<typeof proposalSchema>>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      jobDescription: "",
      timeframe: "",
      budget: job.budget ? job.budget.toString() : "",
    },
  })

  const onSubmit = async (values: z.infer<typeof proposalSchema>) => {
    setSubmitting(true)
    try {
      const payload = {
        jobId: job._id,
        clientId: job.client,
        jobDescription: values.jobDescription,
        timeframe: values.timeframe,
        budget: Number(values.budget),
      }

      const res = await fetch("/api/jobs/requests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success("Proposal submitted successfully!")
        form.reset()
        onSuccess()
      } else {
        toast.error(data.message || "Failed to submit proposal")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit Proposal</DialogTitle>
          <DialogDescription>
            Proposing for: <strong className="text-foreground">{job.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Proposed Budget (₦)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 50000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="timeframe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Timeframe</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 3 days, 1 week..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Letter / Proposal Details</FormLabel>
                  <FormControl>
                    <textarea 
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Explain why you are the best fit for this job..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Proposal"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
