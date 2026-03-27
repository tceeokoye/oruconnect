"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Search, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Verification {
  id: string
  businessName: string
  ownerName: string
  category: string
  state: string
  nin: string
  cacNo: string
  submittedDate: string
  status: string
  documents: number
}

export default function VerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const [approveModalOpen, setApproveModalOpen] = useState<string | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  useEffect(() => {
    fetchVerifications()
  }, [])

  const fetchVerifications = async () => {
    try {
      const res = await axios.get("/api/admin/verification")
      if (res.data.success) {
        setVerifications(res.data.data)
      }
    } catch (error) {
      toast.error("Failed to load verifications")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!approveModalOpen) return
    const id = approveModalOpen

    setProcessingId(id)
    try {
      await axios.post(`/api/admin/verification/${id}/approve`)
      toast.success("Business approved successfully")
      setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: "approved" } : v))
      setApproveModalOpen(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve business")
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async () => {
    if (!rejectModalOpen) return
    const id = rejectModalOpen

    setProcessingId(id)
    try {
      await axios.post(`/api/admin/verification/${id}/reject`, { reason: rejectReason })
      toast.success("Business rejected and removed")
      setVerifications(prev => prev.filter(v => v.id !== id))
      setRejectModalOpen(null)
      setRejectReason("")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject business")
    } finally {
      setProcessingId(null)
    }
  }

  const filteredVerifications = verifications.filter((v) => {
    const matchesSearch =
      v.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || v.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Business Verifications</h1>
        <p className="text-muted-foreground mt-1">Review and approve business registration documents</p>
      </motion.div>

      {/* Filters */}
      <motion.div className="flex gap-4 flex-col md:flex-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by business name or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex gap-2">
          {["all", "pending", "approved"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === status ? "bg-primary text-white" : "border border-border hover:border-primary"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Verifications List */}
      <motion.div
        className="space-y-4"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="visible"
      >
        {filteredVerifications.map((verification) => (
          <motion.div
            key={verification.id}
            whileHover={{ x: 4 }}
            className="bg-card border border-border rounded-lg p-6 space-y-4 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{verification.businessName}</h3>
                <p className="text-sm text-muted-foreground">{verification.ownerName}</p>

                <div className="flex flex-wrap gap-4 mt-3">
                  <span className="text-sm text-muted-foreground">{verification.category}</span>
                  <span className="text-sm text-muted-foreground">{verification.state}</span>
                  <span className="text-sm text-muted-foreground">NIN: {verification.nin}</span>
                  <span className="text-sm text-muted-foreground">CAC: {verification.cacNo}</span>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    verification.status === "approved"
                      ? "bg-green-500/10 text-green-600"
                      : "bg-yellow-500/10 text-yellow-600"
                  }`}
                >
                  {verification.status === "approved" ? "✓ Approved" : "Pending"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(verification.submittedDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {verification.status === "pending" && (
              <div className="border-t border-border pt-4 flex flex-wrap sm:flex-nowrap gap-2">
                <Link
                  href={`/admin/verifications/${verification.id}`}
                  className="flex-1 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Review Documents
                </Link>
                <button 
                  disabled={processingId === verification.id || !!approveModalOpen || !!rejectModalOpen}
                  onClick={() => setApproveModalOpen(verification.id)}
                  className="flex-1 px-4 py-2 bg-green-500/10 text-green-600 border border-green-500/30 rounded-lg hover:bg-green-500 hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processingId === verification.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Approve
                </button>
                <button 
                  disabled={processingId === verification.id || !!approveModalOpen || !!rejectModalOpen}
                  onClick={() => setRejectModalOpen(verification.id)}
                  className="flex-1 px-4 py-2 bg-red-500/10 text-red-600 border border-red-500/30 rounded-lg hover:bg-red-500 hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processingId === verification.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Reject
                </button>
              </div>
            )}
          </motion.div>
        ))}

        {filteredVerifications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No verifications found</p>
          </div>
        )}
      </motion.div>

      {/* Approval Dialog */}
      <Dialog open={!!approveModalOpen} onOpenChange={(open) => !open && setApproveModalOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Business</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this business? This will verify their account and allow them to accept jobs across the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <button onClick={() => setApproveModalOpen(null)} disabled={!!processingId} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium">
              Cancel
            </button>
            <button onClick={handleApprove} disabled={!!processingId} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 min-w-[140px]">
              {processingId ? <Loader2 className="w-4 h-4 animate-spin" /> : null} 
              Confirm Approval
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={!!rejectModalOpen} onOpenChange={(open) => !open && setRejectModalOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Business Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this request? Providing a reason will help them understand why their registration was denied.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
             <label className="block text-sm font-medium mb-2">Rejection Reason</label>
             <textarea 
               className="w-full border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none bg-background" 
               rows={3} 
               placeholder="Optional explanation..."
               value={rejectReason}
               onChange={(e) => setRejectReason(e.target.value)}
             />
          </div>
          <DialogFooter>
            <button onClick={() => setRejectModalOpen(null)} disabled={!!processingId} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium">
              Cancel
            </button>
            <button onClick={handleReject} disabled={!!processingId} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 min-w-[140px]">
              {processingId ? <Loader2 className="w-4 h-4 animate-spin" /> : null} 
              Confirm Rejection
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
