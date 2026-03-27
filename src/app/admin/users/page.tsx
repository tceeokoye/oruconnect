"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, Search, Slash, CheckCircle, Shield } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { SkeletonTable } from "@/components/ui/skeleton-table"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/admin/users?role=all")
      setUsers(res.data.data)
    } catch (error) {
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? "suspend" : "activate"
    if (!confirm(`Are you sure you want to ${action} this user?`)) return
    
    setProcessingId(userId)
    try {
      await axios.post("/api/admin/users", { userId, action })
      toast.success(`User ${action}d successfully`)
      fetchUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} user`)
    } finally {
      setProcessingId(null)
    }
  }

  const filteredUsers = users.filter(user => 
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <SkeletonTable columns={4} rows={5} />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">Monitor users and suspend accounts if necessary.</p>
      </motion.div>

      {/* Search */}
      <motion.div className="relative max-w-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </motion.div>

      <motion.div 
        className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary font-bold shadow-sm">
                        {user.firstName?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="font-semibold text-[15px]">{user.firstName} {user.lastName}</div>
                        <div className="text-muted-foreground text-xs">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize px-2.5 py-1 rounded-full bg-secondary/10 text-secondary font-medium text-xs">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.isApproved ? (
                      <span className="flex items-center gap-1.5 text-green-600 font-medium text-xs bg-green-500/10 w-fit px-2.5 py-1 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-500 font-medium text-xs bg-red-500/10 w-fit px-2.5 py-1 rounded-full">
                        <Slash className="w-3.5 h-3.5" /> Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role !== "super_admin" && (
                      <Button
                        variant={user.isApproved ? "outline" : "default"}
                        size="sm"
                        disabled={processingId === user._id}
                        onClick={() => handleToggleStatus(user._id, user.isApproved)}
                        className={user.isApproved ? "border-red-500 text-red-500 hover:bg-red-500/10" : "bg-green-600 hover:bg-green-700"}
                      >
                        {processingId === user._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : user.isApproved ? (
                          "Suspend"
                        ) : (
                          "Activate"
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
