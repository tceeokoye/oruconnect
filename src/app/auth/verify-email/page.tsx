"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import Link from "next/link"
import { Mail, ArrowRight, Loader2 } from "lucide-react"

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams?.get("email")
  const token = searchParams?.get("token")

  const [step, setStep] = useState<"pending" | "verified" | "error">("pending")
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [code, setCode] = useState("")

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      toast.error("Please enter a valid 6-digit code")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })

      const result = await response.json()

      if (response.ok) {
        setStep("verified")
        toast.success("Email verified successfully!")
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      } else {
        setStep("error")
        toast.error(result.message || "Verification failed")
      }
    } catch (error) {
      setStep("error")
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setResendCooldown(60)
        toast.success("Verification code sent! Check your email.")
        setCode("")
      } else {
        toast.error("Failed to resend code. Please try again.")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        className="w-full max-w-md space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Pending State */}
        {step === "pending" && (
          <>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Verify Your Email</h1>
                <p className="text-muted-foreground mt-2">
                  We've sent a verification code to
                  <br />
                  <span className="font-semibold text-foreground">{email}</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Enter verification code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background font-mono"
                />
                <p className="text-xs text-muted-foreground mt-2">Check your email for the 6-digit code</p>
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={isLoading || code.length !== 6}
                className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Email
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">Didn't receive the code?</p>
              <button
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || isLoading}
                className="text-primary font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend verification code"}
              </button>
            </div>
          </>
        )}

        {/* Verified State */}
        {step === "verified" && (
          <>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                <span className="text-3xl">✓</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Email Verified!</h1>
                <p className="text-muted-foreground mt-2">Your account is now active. Redirecting to login...</p>
              </div>
            </div>
          </>
        )}

        {/* Error State */}
        {step === "error" && (
          <>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <span className="text-3xl">✕</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Verification Failed</h1>
                <p className="text-muted-foreground mt-2">The code you entered is invalid or expired.</p>
              </div>
            </div>

            <button
              onClick={() => setStep("pending")}
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>

            <button
              onClick={handleResendCode}
              className="w-full py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors"
            >
              Resend Code
            </button>
          </>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Back to{" "}
          <Link href="/auth/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

import { Suspense } from "react"

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <VerifyEmailForm />
    </Suspense>
  )
}
