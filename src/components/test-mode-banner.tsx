"use client"

import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"

export default function TestModeBanner() {
  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-3"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-yellow-900">Test Mode Enabled</p>
          <p className="text-xs text-yellow-800 mt-0.5">
            Authentication is bypassed. Use any email/password to login, or switch roles in the dashboard.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
