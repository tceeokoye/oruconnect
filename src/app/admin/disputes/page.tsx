"use client"

import { motion } from "framer-motion"
import { AlertCircle, MessageCircle, Briefcase } from "lucide-react"
import Link from "next/link"

const DISPUTES = [
  {
    id: "1",
    jobTitle: "House Electrical Rewiring",
    client: "John Doe",
    provider: "ElectroWorks Pro",
    amount: 45000,
    raisedDate: "2026-01-08",
    status: "open",
    reason: "Work not completed as per agreement",
  },
  {
    id: "2",
    jobTitle: "Solar Panel Installation",
    client: "Jane Smith",
    provider: "GreenEnergy Ltd",
    amount: 320000,
    raisedDate: "2026-01-06",
    status: "in_resolution",
    reason: "Substandard materials used",
  },
  {
    id: "3",
    jobTitle: "Plumbing Repair",
    client: "Tech Company",
    provider: "Plumb Masters",
    amount: 12000,
    raisedDate: "2026-01-02",
    status: "resolved",
    reason: "Settled - Partial refund issued",
  },
]

export default function DisputesPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Dispute Resolution</h1>
        <p className="text-muted-foreground mt-1">Manage and resolve job disputes</p>
      </motion.div>

      {/* Disputes List */}
      <motion.div
        className="space-y-4"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="visible"
      >
        {DISPUTES.map((dispute) => {
          const statusColors: Record<string, { bg: string; text: string }> = {
            open: { bg: "bg-red-500/10", text: "text-red-600" },
            in_resolution: { bg: "bg-yellow-500/10", text: "text-yellow-600" },
            resolved: { bg: "bg-green-500/10", text: "text-green-600" },
          }
          const colors = statusColors[dispute.status] || statusColors.open

          return (
            <motion.div
              key={dispute.id}
              whileHover={{ x: 4 }}
              className="bg-card border border-border rounded-lg p-6 space-y-4 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{dispute.jobTitle}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{dispute.reason}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Client</p>
                      <p className="text-sm font-medium">{dispute.client}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Provider</p>
                      <p className="text-sm font-medium">{dispute.provider}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="text-sm font-medium">₦{dispute.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Raised</p>
                      <p className="text-sm font-medium">{new Date(dispute.raisedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-xs font-semibold px-3 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                    {dispute.status.replace(/_/g, " ")}
                  </p>
                </div>
              </div>

              {dispute.status !== "resolved" && (
                <div className="border-t border-border pt-4 flex gap-2">
                  <button className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Open Chat
                  </button>
                  <Link
                    href={`/admin/disputes/${dispute.id}`}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Briefcase className="w-4 h-4" />
                    Review Case
                  </Link>
                </div>
              )}
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
