"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import { ArrowLeft, Briefcase, Calendar, MapPin, DollarSign, Clock, User, ShieldCheck, ArrowRight, Loader2, Info } from "lucide-react"
import type { RootState } from "@/store"

export default function PublicJobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.auth)
  
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${resolvedParams.id}`)
        const data = await response.json()
        if (data.success) {
          setJob(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch job:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [resolvedParams.id])

  const handleAction = () => {
    if (!user) {
      router.push(`/auth/login?redirect=/jobs/${resolvedParams.id}`)
      return
    }
    
    // Redirect based on role or to dashboard
    if (user.role === "PROFESSIONAL") {
      router.push(`/dashboard/provider/jobs?id=${resolvedParams.id}`)
    } else {
      router.push(`/dashboard/client/jobs?id=${resolvedParams.id}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading job opportunity details...</p>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 px-4 text-center">
        <Briefcase className="w-16 h-16 text-muted-foreground/30 mb-2" />
        <h2 className="text-2xl font-bold">Job Not Found</h2>
        <p className="text-muted-foreground max-w-md">The job post you are looking for may have been completed, closed, or does not exist.</p>
        <Link href="/" className="text-primary hover:underline flex items-center gap-2 mt-4">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary font-semibold hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold px-3 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-tighter">
            Open Opportunity
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        {/* Main Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0" />
          
          <div className="relative z-10 space-y-6">
            <div className="space-y-4">
              <span className="px-4 py-1.5 bg-secondary/10 text-secondary text-sm font-bold rounded-full">
                {job.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                {job.title}
              </h1>
            </div>

            <div className="flex flex-wrap gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-secondary" />
                <span className="font-bold text-foreground text-xl">₦{job.budget?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Job Details Content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.section 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-2xl p-8 space-y-4"
            >
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Info className="w-6 h-6 text-primary" />
                Job Description
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-muted/50 border border-border rounded-2xl p-8 space-y-4"
            >
              <h3 className="text-xl font-bold">Expected Timeline</h3>
              <p className="text-lg font-medium text-foreground">
                Completion expected within <span className="text-primary">{job.timeline}</span>
              </p>
            </motion.section>
          </div>

          {/* Sidebar CTA */}
          <div className="space-y-6">
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.4 }}
               className="bg-primary text-white p-8 rounded-3xl space-y-6 shadow-xl shadow-primary/20 sticky top-32"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Apply for this Job</h3>
                <p className="text-primary-foreground/70">
                  Ready to show your skills and earn? Submit your proposal now.
                </p>
              </div>

              {!user && (
                <div className="bg-white/10 p-4 rounded-xl text-sm border border-white/10 italic">
                  <ShieldCheck className="w-4 h-4 inline mr-2 text-secondary" />
                  Authentication is required to bid on jobs or communicate with clients.
                </div>
              )}

              <button 
                onClick={handleAction}
                className="w-full py-4 bg-white text-primary rounded-xl font-bold text-lg hover:bg-secondary hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg active:scale-95"
              >
                {user ? "Send Proposal" : "Login to Apply"}
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold uppercase">
                    {job.client?.firstName?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Client: {job.client?.firstName} {job.client?.lastName}</h4>
                    <p className="text-xs text-white/60">Verified Client</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
