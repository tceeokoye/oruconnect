"use client"

import { useSelector, useDispatch } from "react-redux"
import { setRole } from "@/store/slices/auth-slice"
import type { RootState } from "@/store"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import type { User } from "@/store/slices/auth-slice"

const ROLES: Array<{ value: User["role"]; label: string }> = [
  { value: "client", label: "Client" },
  { value: "provider", label: "Provider" },
  { value: "sub_admin", label: "Sub Admin" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
]

export default function RoleSwitcher() {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)
  const testMode = useSelector((state: RootState) => state.testMode)
  const [isOpen, setIsOpen] = useState(false)

  if (!testMode.enabled || !user) return null

  const handleRoleChange = (role: User["role"]) => {
    dispatch(setRole(role))
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
      >
        {ROLES.find((r) => r.value === user.role)?.label}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="absolute top-full right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden min-w-48"
        >
          {ROLES.map((role) => (
            <button
              key={role.value}
              onClick={() => handleRoleChange(role.value)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                user.role === role.value ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-muted"
              }`}
            >
              {role.label}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}
