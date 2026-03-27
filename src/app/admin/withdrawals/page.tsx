"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { SkeletonTable } from "@/components/ui/skeleton-table"

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchWithdrawals()
  }, [])

  const fetchWithdrawals = async () => {
    try {
      const res = await axios.get("/api/admin/withdrawals?status=pending")
      setWithdrawals(res.data.data)
    } catch (error) {
      toast.error("Failed to load withdrawal requests")
    } finally {
      setLoading(false)
    }
  }

  const handleProcess = async (transactionId: string, action: "approve" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this withdrawal?`)) return
    
    setProcessingId(transactionId)
    try {
      await axios.post("/api/admin/withdrawals", { transactionId, action })
      toast.success(`Withdrawal ${action}d successfully`)
      fetchWithdrawals()
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} withdrawal`)
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <SkeletonTable columns={4} rows={5} />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Withdrawal Requests</h1>
        <p className="text-muted-foreground mt-1">Review and process pending provider withdrawals.</p>
      </motion.div>

      <motion.div 
        className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {withdrawals.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground flex flex-col items-center">
            <CheckCircle className="w-12 h-12 text-primary/40 mb-3" />
            <p className="text-lg font-medium">All caught up!</p>
            <p className="text-sm">No pending withdrawal requests.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {withdrawals.map((withdrawal) => (
              <div key={withdrawal._id} className="p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">₦{(withdrawal.amount || 0).toLocaleString()}</span>
                    <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-xs font-medium">
                      Pending
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Requested by <span className="font-semibold text-foreground">{withdrawal.userId?.firstName} {withdrawal.userId?.lastName}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Acct: {withdrawal.metadata?.accountNumber || 'N/A'} • Bank Code: {withdrawal.metadata?.bankCode || 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(withdrawal.createdAt).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                  <Button 
                    variant="outline" 
                    className="flex-1 md:flex-none border-red-500/20 text-red-500 hover:bg-red-500/10"
                    disabled={processingId === withdrawal._id}
                    onClick={() => handleProcess(withdrawal._id, "reject")}
                  >
                    {processingId === withdrawal._id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                    Reject
                  </Button>
                  <Button 
                    className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white"
                    disabled={processingId === withdrawal._id}
                    onClick={() => handleProcess(withdrawal._id, "approve")}
                  >
                    {processingId === withdrawal._id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
