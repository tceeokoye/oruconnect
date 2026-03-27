"use client"

import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import { TrendingUp, Briefcase, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import type { RootState } from "@/store"

const STATS = [
  {
    icon: Briefcase,
    label: "Active Jobs",
    value: "3",
    change: "+2 this week",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: CheckCircle,
    label: "Completed",
    value: "24",
    change: "+4 this month",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: TrendingUp,
    label: "Total Earnings",
    value: "₦245,000",
    change: "+12% vs last month",
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

const RECENT_JOBS = [
  {
    id: "1",
    title: "Electrical Rewiring - 3BR House",
    client: "John Doe",
    status: "in_progress",
    budget: 45000,
    dueDate: "2026-01-15",
  },
  {
    id: "2",
    title: "Solar Panel Installation",
    client: "Jane Smith",
    status: "pending",
    budget: 320000,
    dueDate: "2026-01-20",
  },
  {
    id: "3",
    title: "Emergency Light Repair",
    client: "Tech Company Ltd",
    status: "in_progress",
    budget: 12000,
    dueDate: "2026-01-10",
  },
]

export default function DashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user)

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
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground mt-1">Here's your business performance overview</p>
      </motion.div>

      {!user?.verified && (
        <motion.div
          className="bg-accent/10 border border-accent/20 rounded-lg p-4 flex items-start gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-accent">Verification Pending</p>
            <p className="text-sm text-accent/70 mt-1">
              Your account is under review. Dashboard features will be available once approved. This typically takes
              24-48 hours.
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
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
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

        <div className="space-y-3">
          {RECENT_JOBS.map((job) => (
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
                  <p className="font-semibold">₦{job.budget.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{new Date(job.dueDate).toLocaleDateString()}</p>
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    job.status === "in_progress" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                  }`}
                >
                  {job.status === "in_progress" ? "In Progress" : "Pending"}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
