"use client"

import { motion } from "framer-motion"
import { AlertCircle, CheckCircle, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

const ADMIN_STATS = [
  {
    icon: AlertCircle,
    label: "Pending Verifications",
    value: "12",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    action: "/admin/verifications",
  },
  {
    icon: Users,
    label: "Total Businesses",
    value: "50K+",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    action: "/admin/users",
  },
  {
    icon: CheckCircle,
    label: "Active Jobs",
    value: "248",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    action: "/admin/dashboard",
  },
  {
    icon: TrendingUp,
    label: "Disputes (7 Days)",
    value: "8",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    action: "/admin/disputes",
  },
]

const RECENT_VERIFICATIONS = [
  {
    id: "1",
    business: "Tech Solutions Ltd",
    owner: "Emmanuel Okafor",
    nin: "12345678901",
    submittedDate: "2026-01-08",
    status: "pending",
  },
  {
    id: "2",
    business: "Clean Pros Ltd",
    owner: "Chioma Anyakoha",
    nin: "98765432109",
    submittedDate: "2026-01-07",
    status: "pending",
  },
  {
    id: "3",
    business: "BuildRight Contractors",
    owner: "Adekunle Johnson",
    nin: "55555555555",
    submittedDate: "2026-01-06",
    status: "approved",
  },
]

export default function AdminDashboardPage() {
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
              className="bg-card border border-border rounded-xl p-6 space-y-4 cursor-pointer group"
              onClick={() => (window.location.href = stat.action)}
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <p className="text-xs text-primary font-semibold group-hover:underline">
                {stat.label === "Pending Verifications" && "Review Now"}
                {stat.label === "Disputes (7 Days)" && "View Disputes"}
                {stat.label !== "Pending Verifications" && stat.label !== "Disputes (7 Days)" && "View All"}
              </p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Recent Verifications */}
      <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
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
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 font-semibold text-sm">Business</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Owner</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Submitted</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Status</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_VERIFICATIONS.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-sm">{item.business}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{item.owner}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(item.submittedDate).toLocaleDateString()}
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
                      {item.status === "pending" && (
                        <Link
                          href={`/admin/verifications/${item.id}`}
                          className="text-primary text-sm font-semibold hover:underline"
                        >
                          Review
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
