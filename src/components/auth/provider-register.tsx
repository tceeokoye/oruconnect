"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { registerSchema, type RegisterFormData } from "@/lib/validation/schemas"
import { NIGERIAN_STATES } from "@/lib/constants/nigerian-states"
import { ArrowLeft, ArrowRight, Upload, Loader2, Camera, IdCard, CheckCircle2 } from "lucide-react"

const CATEGORIES = [
  { id: "1", name: "Plumbing" },
  { id: "2", name: "Electrical" },
  { id: "3", name: "Carpentry" },
  { id: "4", name: "Cleaning" },
  { id: "5", name: "Consulting" },
  { id: "6", name: "Design" },
]

const SUBCATEGORIES: Record<string, Array<{ id: string; name: string }>> = {
  "1": [
    { id: "1.1", name: "Installation" },
    { id: "1.2", name: "Repair" },
    { id: "1.3", name: "Maintenance" },
  ],
  "2": [
    { id: "2.1", name: "Installation" },
    { id: "2.2", name: "Repair" },
    { id: "2.3", name: "Maintenance" },
  ],
  "3": [
    { id: "3.1", name: "Custom Furniture" },
    { id: "3.2", name: "Renovation" },
    { id: "3.3", name: "Repair" },
  ],
}

export default function ProviderRegister() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedState, setSelectedState] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const password = watch("password")
  const categoryId = watch("categoryId")
  
  // Custom File Uploader logic mapped directly to React-Hook-Form payload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "ninImage" | "faceImage" | "cacImage") => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setValue(fieldName, reader.result as string, { shouldValidate: true })
        toast.success(`${fieldName.replace("Image", "")} successfully attached!`)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/register/provider", {
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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Register Your Business</h1>
        <p className="text-muted-foreground">Step {step} of 4 - Get verified and start serving clients</p>
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
        {/* Step 1: Account Info */}
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

        {/* Step 2: Business Info */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Business Name</label>
              <input
                type="text"
                placeholder="Your Business Name"
                {...register("businessName")}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
              />
              {errors.businessName && <p className="text-destructive text-sm mt-1">{errors.businessName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Business Email</label>
              <input
                type="email"
                placeholder="business@example.com"
                {...register("businessEmail")}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
              />
              {errors.businessEmail && <p className="text-destructive text-sm mt-1">{errors.businessEmail.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Business Phone</label>
              <input
                type="tel"
                placeholder="+234 xxx xxx xxxx"
                {...register("businessPhone")}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
              />
              {errors.businessPhone && <p className="text-destructive text-sm mt-1">{errors.businessPhone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Business Description</label>
              <textarea
                placeholder="Tell us about your business..."
                rows={3}
                {...register("businessDescription")}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background resize-none"
              />
              {errors.businessDescription && (
                <p className="text-destructive text-sm mt-1">{errors.businessDescription.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Category & Location */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                {...register("categoryId")}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-destructive text-sm mt-1">{errors.categoryId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subcategory</label>
              <select
                {...register("subcategoryId")}
                disabled={!categoryId}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background disabled:opacity-50"
              >
                <option value="">Select subcategory</option>
                {categoryId &&
                  SUBCATEGORIES[categoryId]?.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
              </select>
              {errors.subcategoryId && <p className="text-destructive text-sm mt-1">{errors.subcategoryId.message}</p>}
            </div>

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
          </div>
        )}

        {/* Step 4: Documents & Verification */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">NIN (National ID) Number</label>
              <input
                type="text"
                placeholder="Your 11-digit NIN"
                {...register("nin")}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
              />
              {errors.nin && <p className="text-destructive text-sm mt-1">{errors.nin.message}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* NIN Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">National ID Image</label>
                <input 
                  type="file" 
                  id="ninImage" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e, "ninImage")} 
                />
                <label 
                  htmlFor="ninImage" 
                  className={`border-2 border-dashed ${watch("ninImage") ? "border-green-500 bg-green-50/10" : "border-border hover:border-primary"} rounded-lg p-6 text-center cursor-pointer transition-colors block`}
                >
                  {watch("ninImage") ? (
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  ) : (
                    <IdCard className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  )}
                  <p className="text-sm font-medium">{watch("ninImage") ? "NIN Attached" : "Upload Front of NIN"}</p>
                </label>
                {errors.ninImage && <p className="text-destructive text-sm mt-1">{errors.ninImage.message}</p>}
              </div>

              {/* Face Verification Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Face Verification (Selfie)</label>
                <input 
                  type="file" 
                  id="faceImage" 
                  accept="image/*" 
                  capture="user"
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e, "faceImage")} 
                />
                <label 
                  htmlFor="faceImage" 
                  className={`border-2 border-dashed ${watch("faceImage") ? "border-green-500 bg-green-50/10" : "border-border hover:border-primary"} rounded-lg p-6 text-center cursor-pointer transition-colors block`}
                >
                  {watch("faceImage") ? (
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  ) : (
                    <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  )}
                  <p className="text-sm font-medium">{watch("faceImage") ? "Selfie Attached" : "Take a Clear Selfie"}</p>
                </label>
                {errors.faceImage && <p className="text-destructive text-sm mt-1">{errors.faceImage.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">CAC Certificate (Optional Business Docs)</label>
              <input 
                type="file" 
                id="cacImage" 
                accept="image/*,.pdf" 
                className="hidden" 
                onChange={(e) => handleFileUpload(e, "cacImage")} 
              />
              <label 
                htmlFor="cacImage" 
                className={`border-2 border-dashed ${watch("cacImage") ? "border-green-500 bg-green-50/10" : "border-border hover:border-primary"} rounded-lg p-4 text-center cursor-pointer transition-colors block`}
              >
                {watch("cacImage") ? (
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                ) : (
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                )}
                <p className="text-sm font-medium">{watch("cacImage") ? "CAC Attached" : "Click to upload CAC certificate"}</p>
              </label>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <input
                type="checkbox"
                id="terms"
                {...register("agreeToTerms")}
                className="w-4 h-4 rounded border-border"
              />
              <label htmlFor="terms" className="text-sm">
                I strictly agree that my submitted identity documents are genuine and authorize verification checks.
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

          {step < 4 ? (
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
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Business Submitted!</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We've successfully received your provider registration. An email with a secure verification link has been sent to <br />
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
