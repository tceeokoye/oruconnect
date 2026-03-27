"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, Search, ArrowUpRight, ArrowDownLeft, RefreshCcw } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"
import { SkeletonTable } from "@/components/ui/skeleton-table"

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/admin/transactions?type=${filterType}`)
      setTransactions(res.data.data)
    } catch (error) {
      toast.error("Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [filterType])

  const filteredTransactions = transactions.filter(tx => 
    tx.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTypeIcon = (type: string) => {
    if (["credit", "escrow_release"].includes(type)) return <ArrowDownLeft className="w-4 h-4 text-green-500" />
    if (["withdrawal", "debit"].includes(type)) return <ArrowUpRight className="w-4 h-4 text-orange-500" />
    return <RefreshCcw className="w-4 h-4 text-blue-500" />
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Transaction Monitor</h1>
          <p className="text-muted-foreground mt-1">View all platform financial movements.</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div className="flex flex-col sm:flex-row gap-4 justify-between" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by ID, User or Description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
          {["all", "credit", "withdrawal", "escrow_hold", "platform_fee"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                filterType === type ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {type.replace("_", " ")}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Transactions List */}
      <motion.div 
        className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {loading ? (
          <SkeletonTable columns={6} rows={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Transaction ID</th>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {tx.transactionId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">
                        {tx.userId?.firstName} {tx.userId?.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">{tx.userId?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(tx.type)}
                        <span className="font-medium capitalize">{tx.type.replace("_", " ")}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{tx.description}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold">₦{tx.amount?.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        tx.status === "completed" ? "bg-green-500/10 text-green-600" :
                        tx.status === "pending" ? "bg-orange-500/10 text-orange-600" :
                        "bg-red-500/10 text-red-600"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No transactions found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
