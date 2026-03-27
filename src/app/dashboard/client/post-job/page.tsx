"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Suspense } from "react"
import { toast } from "sonner"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

const jobSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  category: z.string().min(1, "Category is required"),
  budget: z.string().min(1, "Budget is required"),
  timeline: z.string().min(1, "Timeline is required"),
  location: z.string().min(1, "Location is required"),
  targetProviderId: z.optional(z.string()),
  attachments: z.optional(z.string()),
})

type JobFormData = z.infer<typeof jobSchema>

function PostJobForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchCategory, setSearchCategory] = useState("")
  const [searchSubcategory, setSearchSubcategory] = useState("")
  const [searchLocation, setSearchLocation] = useState("")
  const [categories, setCategories] = useState<any[]>([])
  
  const [providers, setProviders] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    mode: "onChange"
  })

  // Look for predefined provider id in URL
  useEffect(() => {
    const predefinedId = searchParams?.get("providerId")
    if (predefinedId) {
      setValue("targetProviderId", predefinedId)
    }
  }, [searchParams, setValue])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories")
        const data = await res.json()
        if (data.success) {
          setCategories(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch categories")
      }
    }
    fetchCategories()
  }, [])

  const selectedProviderId = watch("targetProviderId")

  const searchProviders = async () => {
    setSearching(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append("q", searchQuery)
      if (searchCategory) params.append("category", searchCategory)
      if (searchSubcategory) params.append("subcategory", searchSubcategory)
      if (searchLocation) params.append("location", searchLocation)

      const res = await fetch(`/api/providers/search?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setProviders(data.data)
      }
    } catch (error) {
      toast.error("Failed to search providers")
    } finally {
      setSearching(false)
    }
  }

  const onSubmit = async (data: JobFormData) => {
    setIsLoading(true)
    try {
      // Mock API call
      const response = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Job posted successfully!")
        router.push("/dashboard/client/jobs")
      } else {
        toast.error("Failed to post job")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        {/* Back Button */}
        <Link href="/dashboard/client/jobs" className="flex items-center gap-2 text-primary hover:underline w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold">Post a New Job</h1>
          <p className="text-muted-foreground mt-1">Step {step} of 3</p>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-primary h-full"
            initial={{ width: 0 }}
            animate={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1 */}
          <motion.div
            className={`bg-card border border-border rounded-lg p-6 space-y-4 ${step === 1 ? "block" : "hidden"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: step === 1 ? 1 : 0 }}
          >
              <div>
                <label className="block text-sm font-medium mb-2">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g., Install Solar Panels on Roof"
                  {...register("title")}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {errors.title && <p className="text-destructive text-sm mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Job Description</label>
                <textarea
                  placeholder="Describe the job in detail..."
                  rows={4}
                  {...register("description")}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
                {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    {...register("category")}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select category</option>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="cleaning">Cleaning</option>
                  </select>
                  {errors.category && <p className="text-destructive text-sm mt-1">{errors.category.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Budget (NGN)</label>
                  <input
                    type="number"
                    placeholder="50,000"
                    {...register("budget")}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.budget && <p className="text-destructive text-sm mt-1">{errors.budget.message}</p>}
                </div>
              </div>
          </motion.div>

          {/* Step 2: Target Provider (Optional) */}
          <motion.div
            className={`bg-card border border-border rounded-lg p-6 space-y-4 ${step === 2 ? "block" : "hidden"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: step === 2 ? 1 : 0 }}
          >
              <div>
                <label className="block text-sm font-medium mb-1">Directly Assign to Provider (Optional)</label>
                <p className="text-xs text-muted-foreground mb-4">You can search for a specific provider to send this job request directly to them.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Category Filter */}
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Category</label>
                    <select
                      value={searchCategory}
                      onChange={(e) => {
                        setSearchCategory(e.target.value)
                        setSearchSubcategory("") // Reset subcategory when category changes
                      }}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    >
                      <option value="">All Categories</option>
                      {categories.map((c: any) => (
                        <option key={c.id} value={c.name.toLowerCase()}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory Filter */}
                  {searchCategory && categories.find(c => c.name.toLowerCase() === searchCategory)?.subcategories?.length > 0 && (
                    <div>
                      <label className="text-xs font-semibold mb-1 block">Subcategory</label>
                      <select
                        value={searchSubcategory}
                        onChange={(e) => setSearchSubcategory(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                      >
                        <option value="">All Services</option>
                        {categories
                          .find((c: any) => c.name.toLowerCase() === searchCategory)
                          ?.subcategories.map((sub: any) => (
                            <option key={sub.id} value={sub.name.toLowerCase()}>{sub.name}</option>
                          ))}
                      </select>
                    </div>
                  )}

                  {/* Location Filter */}
                  <div className={!searchCategory ? "md:col-span-1" : "md:col-span-2"}>
                    <label className="text-xs font-semibold mb-1 block">Location / City</label>
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      placeholder="e.g. Lagos"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchProviders())}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search providers by name or skills..."
                    className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchProviders())}
                  />
                  <button
                    type="button"
                    onClick={searchProviders}
                    disabled={searching}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 flex items-center justify-center min-w-[100px]"
                  >
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                  </button>
                </div>
              </div>

              {providers.length > 0 ? (
                <div className="mt-4 border border-border rounded-lg overflow-hidden divide-y divide-border">
                  {providers.map((p) => (
                    <div 
                      key={p._id} 
                      className={`p-4 flex items-center justify-between transition-colors ${selectedProviderId === p._id ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-muted/50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                          {p.profilePhoto ? (
                            <img src={p.profilePhoto} alt={p.firstName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-primary text-sm">{p.firstName.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{p.firstName} {p.lastName}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{p.bio || "Service Provider"}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setValue("targetProviderId", selectedProviderId === p._id ? undefined : p._id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          selectedProviderId === p._id 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-foreground hover:bg-border"
                        }`}
                      >
                        {selectedProviderId === p._id ? "Selected ✓" : "Select"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground">
                   No providers found.
                </div>
              )}
              {selectedProviderId && (
                <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-medium flex items-center justify-between">
                  <span>Job will be sent exclusively as a direct request to the selected provider.</span>
                  <button type="button" onClick={() => setValue("targetProviderId", undefined)} className="text-xs underline font-bold px-2 py-1">Clear</button>
                </div>
              )}
            </motion.div>

          {/* Step 3: Details */}
          <motion.div
            className={`bg-card border border-border rounded-lg p-6 space-y-4 ${step === 3 ? "block" : "hidden"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: step === 3 ? 1 : 0 }}
          >
              <div>
                <label className="block text-sm font-medium mb-2">Timeline</label>
                <select
                  {...register("timeline")}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select timeline</option>
                  <option value="urgent">Urgent (1-2 days)</option>
                  <option value="1week">1 Week</option>
                  <option value="2weeks">2 Weeks</option>
                  <option value="flexible">Flexible</option>
                </select>
                {errors.timeline && <p className="text-destructive text-sm mt-1">{errors.timeline.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Job Location</label>
                <input
                  type="text"
                  placeholder="e.g., Lagos, Nigeria"
                  {...register("location")}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {errors.location && <p className="text-destructive text-sm mt-1">{errors.location.message}</p>}
              </div>

              <label className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors block">
                <p className="text-sm text-foreground font-semibold">Click to upload reference images or documents (Optional)</p>
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => {
                  if (e.target.files?.[0]) {
                    toast.success(`Attached: ${e.target.files[0].name}`)
                  }
                }} />
              </label>
            </motion.div>

          {/* Navigation */}
          <div className="flex gap-3 pt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 py-2.5 bg-secondary text-secondary-foreground border border-border rounded-lg font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={async () => {
                  let isValid = true;
                  if (step === 1) {
                    isValid = await trigger(["title", "description", "category", "budget"]);
                  } else if (step === 2) {
                    isValid = await trigger(["targetProviderId"]);
                  }
                  
                  if (isValid) {
                    setStep(step + 1);
                  } else {
                    toast.error("Please fill in all required fields correctly before proceeding.");
                  }
                }}
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                Next Step
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
                    Posting...
                  </>
                ) : (
                  <>
                    Post Job
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PostJobPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <PostJobForm />
    </Suspense>
  )
}
