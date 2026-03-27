"use client"

import { motion } from "framer-motion"
import { Plus, Edit2, Trash2, Shield, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { CreateAdminDialog } from "@/components/admin/create-admin-dialog"

export default function AdminManagementPage() {
  const [showModal, setShowModal] = useState(false)
  const [admins, setAdmins] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  const fetchAdmins = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/admin/manage-admins")
      const data = await res.json()
      if (data.success) {
        setAdmins(data.data)
      } else {
        toast.error(data.message || "Failed to load admins")
      }
    } catch (error) {
      toast.error("An error occurred loading admins")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  return (
    <div className="p-6 space-y-8">
      <CreateAdminDialog 
        open={showModal} 
        onOpenChange={setShowModal} 
        onSuccess={fetchAdmins} 
      />

      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold">Admin Management</h1>
          <p className="text-muted-foreground mt-1">Manage admins and sub-admins across the platform</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Admin
        </button>
      </motion.div>

      <motion.div
        className="bg-card border border-border rounded-lg overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="overflow-x-auto min-h-[300px] relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : admins.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground">No custom admins found.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {admins.map((admin) => (
                  <motion.tr key={admin.id} variants={itemVariants} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold">
                      {admin.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{admin.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold capitalize">
                        <Shield className="w-3 h-3" />
                        {admin.role.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold capitalize">Active</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4 text-primary" />
                      </button>
                      <button className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  )
}
