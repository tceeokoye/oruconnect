"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import { TrendingUp, Briefcase, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import type { RootState } from "@/store"

export default function DashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user)
  const token = useSelector((state: RootState) => state.auth.token)

  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/provider/jobs", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success && data.data) {
          setJobs(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (token) fetchDashboardData()
  }, [token])

  const activeJobs = jobs.filter(j => j.status === "in_progress").length
  const completedJobs = jobs.filter(j => j.status === "completed").length
  const totalEarnings = jobs
    .filter(j => j.status === "completed")
    .reduce((acc, curr) => acc + (Number(curr.budget) || 0), 0)

  const STATS = [
    {
      icon: Briefcase,
      label: "Active Jobs",
      value: isLoading ? "-" : activeJobs.toString(),
      change: "Currently in progress",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: isLoading ? "-" : completedJobs.toString(),
      change: "Total jobs finished",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: TrendingUp,
      label: "Total Earnings",
      value: isLoading ? "-" : `₦${totalEarnings.toLocaleString()}`,
      change: "From completed jobs",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: Clock,
      label: "Avg Response Time",
      value: "2h 15m",
      change: "Excellent",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(" ")[0] || "Provider"}!</h1>
        <p className="text-muted-foreground mt-1">Here's your business performance overview</p>
      </motion.div>

      {!user?.verified && (
        <motion.div
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-600">Verification Pending</p>
            <p className="text-sm text-yellow-600/80 mt-1">
              Your account is under review. Dashboard features will be fully functional once approved. Ensure your profile is completely filled out.
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-card border border-border rounded-xl p-6 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <p className="text-2xl font-bold">{stat.value}</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Recent Jobs */}
      <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Jobs</h2>
          <Link href="/dashboard/provider/jobs" className="text-primary font-semibold hover:underline">
            View All
          </Link>
        </div>

        <div className="space-y-3 relative min-h-[150px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground">No recent jobs to display</p>
              <Link href="/dashboard/provider/explore" className="text-primary hover:underline text-sm font-medium mt-2 inline-block">
                Explore Available Requests
              </Link>
            </div>
          ) : (
            jobs.slice(0, 5).map((job) => (
              <motion.div
                key={job.id}
                whileHover={{ x: 4 }}
                className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <p className="font-semibold">{job.title}</p>
                  <p className="text-sm text-muted-foreground">{job.client}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-semibold">₦{Number(job.budget || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(job.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      job.status === "completed" 
                        ? "bg-green-500/10 text-green-600"
                        : job.status === "in_progress" 
                          ? "bg-blue-500/10 text-blue-600" 
                          : "bg-yellow-500/10 text-yellow-600"
                    }`}
                  >
                    {job.status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
