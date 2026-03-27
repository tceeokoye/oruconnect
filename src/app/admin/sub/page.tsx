"use client"

import { motion } from "framer-motion"
import { Users, CheckCircle, Clock, AlertCircle } from "lucide-react"

export default function SubAdminDashboard() {
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

  const STATS = [
    {
      label: "Pending Reviews",
      value: "12",
      icon: Clock,
      bgColor: "bg-accent/10",
      iconColor: "text-accent",
    },
    {
      label: "Reviewed This Month",
      value: "47",
      icon: CheckCircle,
      bgColor: "bg-secondary/10",
      iconColor: "text-secondary",
    },
    {
      label: "Awaiting Approval",
      value: "8",
      icon: AlertCircle,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "Total Businesses",
      value: "124",
      icon: Users,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
    },
  ]

  return (
    <div className="p-6 space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Sub-Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Review and manage provider registrations</p>
      </motion.div>

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
              className={`${stat.bgColor} border border-border rounded-xl p-6 space-y-3`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      <motion.div
        className="bg-card border border-border rounded-lg p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-bold mb-4">Recent Submissions</h2>
        <div className="space-y-3">
          {[
            { name: "ElectroWorks Pro", status: "pending", submittedDate: "2026-01-06" },
            { name: "Plumb Masters", status: "pending", submittedDate: "2026-01-05" },
            { name: "Interior Design Hub", status: "pending", submittedDate: "2026-01-04" },
          ].map((submission) => (
            <div
              key={submission.name}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <div>
                <p className="font-semibold">{submission.name}</p>
                <p className="text-sm text-muted-foreground">Submitted {submission.submittedDate}</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-secondary/10 text-secondary rounded-lg font-semibold hover:bg-secondary hover:text-white transition-colors">
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
