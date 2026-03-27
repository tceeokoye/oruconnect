"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { z } from "zod"
import { NIGERIAN_STATES } from "@/lib/constants/nigerian-states"
import { ArrowLeft, ArrowRight, Loader2, CheckCircle } from "lucide-react"

const clientRegisterSchema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(11, "Valid phone number required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type ClientRegisterFormData = z.infer<typeof clientRegisterSchema>

export default function ClientRegister() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedState, setSelectedState] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ClientRegisterFormData>({
    resolver: zodResolver(clientRegisterSchema),
  })

  const password = watch("password")

  const onSubmit = async (data: ClientRegisterFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/register/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success("Registration successful! Check your email to verify your account.")
        setRegisteredEmail(data.email)
        setShowSuccess(true)
      } else {
        toast.error(result.message || "Registration failed")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
      console.log("errorsss:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Create Your Account</h1>
        <p className="text-muted-foreground">Step {step} of 2 - Hire verified service providers</p>
      </div>

      <form 
        onSubmit={handleSubmit(onSubmit, (formErrors) => {
          const firstError = Object.values(formErrors)[0];
          if (firstError) {
            toast.error(String(firstError.message) || "Please check previous steps and fix all errors.");
          }
        })} 
        className="space-y-6"
      >
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  {...register("firstName")}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                />
                {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  {...register("lastName")}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                />
                {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                {...register("email")}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
              />
              {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                placeholder="+234 xxx xxx xxxx"
                {...register("phone")}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
              />
              {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
              />
              {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
              />
              {errors.confirmPassword && (
                <p className="text-destructive text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <select
                  {...register("state")}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                >
                  <option value="">Select state</option>
                  {Object.keys(NIGERIAN_STATES).map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.state && <p className="text-destructive text-sm mt-1">{errors.state.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <select
                  {...register("city")}
                  disabled={!selectedState}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background disabled:opacity-50"
                >
                  <option value="">Select city</option>
                  {selectedState &&
                    NIGERIAN_STATES[selectedState]?.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                </select>
                {errors.city && <p className="text-destructive text-sm mt-1">{errors.city.message}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="terms"
                {...register("agreeToTerms")}
                className="w-4 h-4 rounded border-border"
              />
              <label htmlFor="terms" className="text-sm">
                I agree to the Terms & Conditions
              </label>
            </div>
            {errors.agreeToTerms && <p className="text-destructive text-sm">{errors.agreeToTerms.message}</p>}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex-1 py-2.5 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}

          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex-1 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </motion.div>

    {showSuccess && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card w-full max-w-md p-8 rounded-2xl shadow-lg border border-border text-center space-y-6"
        >
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Account Created!</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We've successfully created your client account. An email with a secure verification link has been sent to <br />
              <span className="font-semibold text-foreground">{registeredEmail}</span>
            </p>
          </div>

          <button
            onClick={() => router.push("/auth/verify-email?email=" + encodeURIComponent(registeredEmail))}
            className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Verify Email
          </button>
        </motion.div>
      </div>
    )}
    </>
  )
}
