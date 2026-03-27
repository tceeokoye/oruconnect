"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, Send, Plus, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { SkeletonCard } from "@/components/ui/skeleton-card"

export default function WalletPage() {
  const [showBalance, setShowBalance] = useState(true)
  const [wallet, setWallet] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Withdrawal State
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [bankCode, setBankCode] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchWallet()
  }, [])

  const fetchWallet = async () => {
    try {
      const res = await axios.get("/api/wallet")
      setWallet(res.data.data.wallet)
      setTransactions(res.data.data.transactions)
    } catch (error) {
      toast.error("Failed to load wallet data")
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!withdrawAmount || Number(withdrawAmount) < 1000) {
      toast.error("Minimum withdrawal is ₦1,000")
      return
    }

    setSubmitting(true)
    try {
      const res = await axios.post("/api/wallet", {
        amount: Number(withdrawAmount),
        accountNumber,
        bankCode,
      })
      toast.success(res.data.message || "Withdrawal requested successfully")
      setShowWithdraw(false)
      setWithdrawAmount("")
      fetchWallet()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to request withdrawal")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <SkeletonCard />
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Wallet & Earnings</h1>
        <p className="text-muted-foreground mt-1">Manage your funds and view transaction history</p>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4 items-center">
            <h2 className="font-semibold text-primary">Available Balance</h2>
            <button onClick={() => setShowBalance(!showBalance)} className="p-2 hover:bg-primary/10 rounded-lg">
              {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
          <div className="text-right">
            <h2 className="font-medium text-muted-foreground">In Escrow</h2>
            <p className="text-xl font-semibold opacity-70">
              {showBalance ? `₦${(wallet?.lockedBalance || 0).toLocaleString()}` : "••••••"}
            </p>
          </div>
        </div>

        <div className="text-4xl font-bold mb-8">
          {showBalance ? `₦${(wallet?.availableBalance || 0).toLocaleString()}` : "••••••"}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <button 
            onClick={() => setShowWithdraw(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            <Send className="w-4 h-4" />
            Withdraw
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-semibold">
            <Plus className="w-4 h-4" />
            Add Funds
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-semibold">
            <CreditCard className="w-4 h-4" />
            Bank Account
          </button>
        </div>
      </motion.div>

      {/* Withdrawal Form Modal */}
      <AnimatePresence>
        {showWithdraw && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-card w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="p-6 border-b border-border">
                <h3 className="text-xl font-bold">Withdraw Funds</h3>
                <p className="text-sm text-muted-foreground">Transfer to your local bank account</p>
              </div>
              <form onSubmit={handleWithdraw} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (₦)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    max={wallet?.availableBalance || 0}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="e.g. 5000"
                  />
                  <p className="text-xs text-muted-foreground flex justify-between">
                    <span>Min: ₦1,000</span>
                    <span>Max: ₦{(wallet?.availableBalance || 0).toLocaleString()}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account Number</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="10-digit account number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bank Code</label>
                  <input
                    type="text"
                    required
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="e.g. 058 (GTBank)"
                  />
                </div>
                <div className="pt-4 flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowWithdraw(false)}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Submit Request
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <motion.div
        className="grid md:grid-cols-3 gap-4"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="visible"
      >
        {[
          { label: "Total Earned", value: `₦${(wallet?.totalEarned || 0).toLocaleString()}` },
          { label: "Total Spent", value: `₦${(wallet?.totalSpent || 0).toLocaleString()}` },
          { label: "In Escrow", value: `₦${(wallet?.lockedBalance || 0).toLocaleString()}` },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            className="bg-card border border-border rounded-lg p-5 space-y-1 shadow-sm"
            whileHover={{ y: -2 }}
          >
            <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Transactions */}
      <motion.div className="space-y-4 mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <h2 className="text-xl font-bold">Recent Transactions</h2>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-10 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground">No recent transactions to display</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <motion.div
                key={tx._id}
                whileHover={{ x: 4 }}
                className="bg-card border border-border rounded-lg p-5 flex items-center justify-between hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <p className="font-semibold text-[15px]">{tx.description}</p>
                  <div className="flex gap-4 mt-1">
                    <p className="text-xs font-medium px-2 py-0.5 bg-muted rounded-full">
                      {tx.type.toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs font-medium text-orange-500 mt-0.5 capitalize">{tx.status}</p>
                  </div>
                </div>

                <p className={`font-bold text-lg ${['credit', 'escrow_release'].includes(tx.type) ? "text-green-600" : tx.type === 'withdrawal' ? "text-orange-500" : "text-red-600"}`}>
                  {['credit', 'escrow_release'].includes(tx.type) ? "+" : "-"}₦{(tx.amount || 0).toLocaleString()}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
