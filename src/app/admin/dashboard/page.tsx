"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle, Users, TrendingUp, Loader2 } from "lucide-react"
import Link from "next/link"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [recentVerifications, setRecentVerifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/admin/dashboard")
        const data = await response.json()
        if (data.success && data.data) {
          setStats(data.data.stats)
          setRecentVerifications(data.data.recentVerifications)
        }
      } catch (error) {
        console.error("Failed to fetch admin dashboard", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const ADMIN_STATS = [
    {
      icon: AlertCircle,
      label: "Pending Verifications",
      value: isLoading ? "-" : `${stats?.pendingVerifications || 0}`,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      action: "/admin/verifications",
    },
    {
      icon: Users,
      label: "Total Businesses",
      value: isLoading ? "-" : `${stats?.totalBusinesses || 0}`,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      action: "/admin/verifications",
    },
    {
      icon: CheckCircle,
      label: "Active Jobs",
      value: isLoading ? "-" : `${stats?.activeJobs || 0}`,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      action: "/admin/transactions", // No distinct generic admin jobs page yet
    },
    {
      icon: TrendingUp,
      label: "Total Disputes",
      value: isLoading ? "-" : `${stats?.totalDisputes || 0}`,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      action: "/admin/disputes",
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
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of platform activity and pending actions</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {ADMIN_STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              onClick={() => (window.location.href = stat.action)}
              className="bg-card border border-border rounded-xl p-6 space-y-4 cursor-pointer hover:shadow-md transition-shadow group"
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
              </div>
              <p className="text-xs text-primary font-semibold group-hover:underline">
                {stat.label === "Pending Verifications" && "Review Now"}
                {stat.label === "Total Disputes" && "View Disputes"}
                {stat.label !== "Pending Verifications" && stat.label !== "Total Disputes" && "View All"}
              </p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Recent Verifications */}
      <motion.div className="space-y-4 relative min-h-[300px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Verification Submissions</h2>
          <Link href="/admin/verifications" className="text-primary font-semibold hover:underline">
            View All
          </Link>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left px-6 py-4 font-semibold text-sm">Business</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Owner</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Submitted</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Status</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    </td>
                  </tr>
                ) : recentVerifications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No recent verifications available.
                    </td>
                  </tr>
                ) : (
                  recentVerifications.map((item) => (
                    <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-sm">{item.business}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{item.owner}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(item.submittedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            item.status === "approved"
                              ? "bg-green-500/10 text-green-600"
                              : "bg-yellow-500/10 text-yellow-600"
                          }`}
                        >
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/verifications`}
                          className="text-primary text-sm font-semibold hover:underline"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
