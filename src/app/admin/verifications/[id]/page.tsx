"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, FileText, Download, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useState, useEffect, use } from "react"
import { toast } from "sonner"
import axios from "axios"
import { useRouter } from "next/navigation"

interface VerificationDetail {
  id: string
  businessName: string
  ownerName: string
  email: string
  phone: string
  category: string
  subcategory: string
  state: string
  city: string
  nin: string
  cacNo: string
  businessAddress: string
  submittedDate: string
  documents: { name: string; url: string; verified: boolean }[]
}

export default function VerificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [verification, setVerification] = useState<VerificationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null)
  const [notes, setNotes] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchVerificationDetails()
  }, [resolvedParams.id])

  const fetchVerificationDetails = async () => {
    try {
      const res = await axios.get(`/api/admin/verification/${resolvedParams.id}`)
      if (res.data.success) {
        setVerification(res.data.data)
      }
    } catch (error) {
      toast.error("Failed to load verification details")
      router.push("/admin/verifications")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    setProcessing(true)
    try {
      await axios.post(`/api/admin/verification/${resolvedParams.id}/approve`)
      toast.success("Business approved successfully!")
      router.push("/admin/verifications")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve business")
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!notes.trim()) {
      toast.error("Please provide rejection reason")
      return
    }
    setProcessing(true)
    try {
      await axios.post(`/api/admin/verification/${resolvedParams.id}/reject`, { reason: notes })
      toast.success("Business rejected. The record has been removed.")
      router.push("/admin/verifications")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject business")
    } finally {
      setProcessing(false)
    }
  }

  if (loading || !verification) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Link href="/admin/verifications" className="flex items-center gap-2 text-primary hover:underline w-fit">
        <ArrowLeft className="w-4 h-4" />
        Back to Verifications
      </Link>

      {/* Business Info */}
      <motion.div
        className="bg-card border border-border rounded-lg p-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold">{verification.businessName}</h1>
          <p className="text-muted-foreground mt-2">Owner: {verification.ownerName}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 border-t border-border pt-6">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{verification.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{verification.phone}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Category</p>
            <p className="font-medium">
              {verification.category} • {verification.subcategory}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Location</p>
            <p className="font-medium">
               {verification.businessAddress}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">NIN</p>
            <p className="font-medium">{verification.nin}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">CAC No.</p>
            <p className="font-medium">{verification.cacNo}</p>
          </div>
        </div>
      </motion.div>

      {/* Documents */}
      <motion.div
        className="bg-card border border-border rounded-lg p-6 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-bold">Documents</h2>

        {verification.documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents uploaded.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {verification.documents.map((doc, idx) => (
              <div
                key={idx}
                className="overflow-hidden border border-border rounded-lg bg-muted flex flex-col items-center justify-center p-2"
              >
                {doc.url.startsWith("data:image") ? (
                  // Handling base64 encoded images directly
                  <img src={doc.url} alt={doc.name} className="w-full h-48 object-cover rounded shadow-sm" />
                ) : (
                  // Handling external URL
                  <img src={doc.url} alt={doc.name} className="w-full h-48 object-cover rounded shadow-sm" />
                )}
                <div className="w-full p-2 flex justify-between items-center mt-2 bg-card rounded">
                  <p className="font-medium text-sm truncate">{doc.name}</p>
                  <a
                    href={doc.url}
                    download={doc.name}
                    className="p-1 hover:bg-muted rounded-lg transition-colors text-primary"
                    aria-label="Download Document"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Decision Section */}
      <motion.div
        className="bg-card border border-border rounded-lg p-6 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-bold">Verification Decision</h2>

        <div className="space-y-3">
          <label className="flex items-start gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
            <input
              type="radio"
              name="decision"
              value="approve"
              checked={decision === "approve"}
              onChange={() => setDecision("approve")}
              className="mt-1"
            />
            <div>
              <p className="font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Approve Business
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This will verify the business and allow them to accept jobs
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
            <input
              type="radio"
              name="decision"
              value="reject"
              checked={decision === "reject"}
              onChange={() => setDecision("reject")}
              className="mt-1"
            />
            <div>
              <p className="font-medium flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                Reject Business
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Provide a reason for rejection - owner will be notified
              </p>
            </div>
          </label>
        </div>

        {decision === "reject" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3 pt-2"
          >
            <label className="block text-sm font-medium">Rejection Reason</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain why this business is being rejected..."
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none bg-background"
            />
          </motion.div>
        )}

        <div className="flex gap-3 pt-4 border-t border-border mt-4">
          <button
            onClick={() => { setDecision(null); setNotes(""); }}
            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
            disabled={processing}
          >
            Cancel
          </button>
          {decision === "approve" && (
            <button
              onClick={handleApprove}
              disabled={processing}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Confirm Approval
            </button>
          )}
          {decision === "reject" && (
            <button
              onClick={handleReject}
              disabled={processing}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Confirm Rejection
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
