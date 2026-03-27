"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, Send, Plus, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { SkeletonCard } from "@/components/ui/skeleton-card"

export default function ClientWalletPage() {
  const [showBalance, setShowBalance] = useState(true)
  const [wallet, setWallet] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Deposit State (Mocked)
  const [showDeposit, setShowDeposit] = useState(false)
  const [depositAmount, setDepositAmount] = useState("")
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

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!depositAmount || Number(depositAmount) < 1000) {
      toast.error("Minimum deposit is ₦1,000")
      return
    }

    setSubmitting(true)

    // Ensure the Monnify SDK is loaded
    if (typeof window !== "undefined" && !(window as any).MonnifySDK) {
      toast.error("Payment gateway is still loading. Please try again in a moment.")
      setSubmitting(false)
      return
    }

    const reference = `MNFY_${Date.now()}_${Math.floor(Math.random() * 1000000)}`

    try {
      // Launch Monnify Inline SDK
      ;(window as any).MonnifySDK.initialize({
        amount: Number(depositAmount),
        currency: "NGN",
        reference: reference,
        customerFullName: "OruConnect Client", 
        customerEmail: "client@oruconnect.com",
        apiKey: process.env.NEXT_PUBLIC_MONIFY_PUBLIC_KEY || "MK_TEST_XXXXXXXXX",
        contractCode: process.env.NEXT_PUBLIC_MONIFY_CONTRACT_CODE || "XXXXXXXX",
        paymentDescription: "OruConnect Wallet Deposit",
        isTestMode: true,
        metaData: {
          userId: wallet?.userId
        },
        onLoadStart: () => {
          setSubmitting(false)
        },
        onLoadComplete: () => {
          setSubmitting(false)
        },
        onComplete: function(response: any) {
          (async () => {
            if (response.paymentStatus === "PAID" || response.status === "SUCCESS") {
              try {
                toast.loading("Verifying transaction...")
                await axios.post("/api/wallet/verify-monnify", {
                  reference: response.transactionReference || reference,
                  amount: Number(depositAmount),
                  status: "PAID"
                })
                toast.dismiss()
                toast.success(`₦${Number(depositAmount).toLocaleString()} added successfully to wallet!`)
                setShowDeposit(false)
                setDepositAmount("")
                fetchWallet()
              } catch (err: any) {
                toast.dismiss()
                toast.error(err.response?.data?.message || "Failed to verify deposit")
              }
            } else {
              toast.error("Payment was not successful.")
            }
            setSubmitting(false)
          })()
        },
        onClose: function(data: any) {
          toast.info("Payment window closed")
          setSubmitting(false)
        }
      })
    } catch (err) {
      toast.error("Failed to initialize payment gateway. Please check your API keys.")
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
      {/* Monnify SDK injection */}
      <Script src="https://sdk.monnify.com/plugin/monnify.js" strategy="lazyOnload" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">My Wallet</h1>
        <p className="text-muted-foreground mt-1">Manage your funds and track payment history</p>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        className="relative overflow-hidden bg-gradient-to-br from-primary/90 to-primary rounded-3xl p-8 md:p-10 shadow-xl shadow-primary/20 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 blur-2xl rounded-full -ml-10 -mb-10 pointer-events-none" />
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4 items-center relative z-10">
            <h2 className="font-semibold text-white/90 uppercase tracking-wider text-sm">Available Balance</h2>
            <button onClick={() => setShowBalance(!showBalance)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              {showBalance ? <Eye className="w-5 h-5 text-white" /> : <EyeOff className="w-5 h-5 text-white" />}
            </button>
          </div>
          <div className="text-right relative z-10">
            <h2 className="font-medium text-white/80 uppercase tracking-wider text-sm">In Escrow</h2>
            <p className="text-2xl font-bold text-white">
              {showBalance ? `₦${(wallet?.lockedBalance || 0).toLocaleString()}` : "••••••"}
            </p>
          </div>
        </div>

        <div className="text-5xl md:text-6xl font-bold mb-10 tracking-tight relative z-10">
          {showBalance ? `₦${(wallet?.availableBalance || 0).toLocaleString()}` : "••••••"}
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-lg relative z-10">
          <button 
            onClick={() => setShowDeposit(true)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-primary rounded-xl hover:bg-white/90 transition-all font-bold shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            <Plus className="w-5 h-5" />
            Add Funds
          </button>
          <button 
            onClick={() => toast.info("Payment Methods are securely managed by Monnify during your checkout session.")}
            className="flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-white/20 text-white rounded-xl hover:bg-white/10 transition-all font-bold hover:-translate-y-1"
          >
            <CreditCard className="w-5 h-5" />
            Payment Methods
          </button>
        </div>
      </motion.div>

      {/* Deposit Form Modal */}
      <AnimatePresence>
        {showDeposit && (
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
                <h3 className="text-xl font-bold">Add Funds to Wallet</h3>
                <p className="text-sm text-muted-foreground">Top up via Paystack or Monnify</p>
              </div>
              <form onSubmit={handleDeposit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (₦)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="e.g. 10000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum deposit: ₦1,000
                  </p>
                </div>
                <div className="pt-4 flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowDeposit(false)}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Proceed to Payment
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <motion.div
        className="grid md:grid-cols-2 gap-4"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="visible"
      >
        {[
          { label: "Total Spent", value: `₦${(wallet?.totalSpent || 0).toLocaleString()}` },
          { label: "In Escrow", value: `₦${(wallet?.lockedBalance || 0).toLocaleString()}` },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            className="bg-card border border-border/50 rounded-2xl p-6 space-y-2 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors"
            whileHover={{ y: -4 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-sm text-muted-foreground font-semibold tracking-wide uppercase">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
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
                whileHover={{ y: -2, scale: 1.005 }}
                className="bg-card border border-border/40 rounded-xl p-5 flex items-center justify-between hover:shadow-lg transition-all"
              >
                <div className="flex-1">
                  <p className="font-bold text-base">{tx.description}</p>
                  <div className="flex gap-3 mt-2 items-center">
                    <p className={`text-xs font-bold px-3 py-1 bg-muted rounded-full ${tx.type === 'credit' ? 'text-green-600 bg-green-500/10' : 'text-red-600 bg-red-500/10'}`}>
                      {tx.type.toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 mr-2" />
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs font-bold text-orange-500 capitalize flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2" />
                      {tx.status}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-bold text-xl ${tx.type === 'credit' ? "text-green-600" : "text-red-600"}`}>
                    {tx.type === 'credit' ? "+" : "-"}₦{(tx.amount || 0).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
