"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Loader2, Camera, UserCircle, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDispatch } from "react-redux"
import { setUser } from "@/store/slices/auth-slice"
import axios from "axios"
import { NIGERIAN_STATES } from "@/lib/constants/nigerian-states"

export default function ClientProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  
  const dispatch = useDispatch()
  const { register, handleSubmit, reset, watch, setValue } = useForm()
  const watchState = watch("state")

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await axios.get("/api/client/profile")
      if (res.data.success) {
        const data = res.data.data
        const nameParts = (data.name || "").split(" ")
        
        reset({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: data.email || "",
          phoneNumber: data.phone || "",
          state: data.state || "",
          city: data.city || "",
        })
        setProfilePhoto(data.profileImage || null)
      }
    } catch (error) {
      toast.error("Failed to load profile data")
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB")
      return
    }

    try {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append("file", file)

      const res = await axios.post("/api/upload", formData)
      
      if (res.data.success) {
        setProfilePhoto(res.data.data.url)
        toast.success("Profile photo uploaded")
      }
    } catch (error) {
      toast.error("Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  const onSubmit = async (data: any) => {
    try {
      setSaving(true)
      const payload = {
        name: `${data.firstName} ${data.lastName}`.trim(),
        phone: data.phoneNumber,
        state: data.state,
        city: data.city,
        profileImage: profilePhoto,
      }

      const res = await axios.put("/api/client/profile", payload)
      
      if (res.data.success) {
        toast.success("Profile updated successfully!")
        // Update local Redux state so navbar reflects changes if needed
        dispatch(setUser(res.data.data))
      }
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information and account settings</p>
      </motion.div>

      <motion.div 
        className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-muted border-4 border-background shadow-lg">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                    <UserCircle className="w-16 h-16" />
                  </div>
                )}
                
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center">
                <label className="cursor-pointer bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Change Photo
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
                <p className="text-xs text-muted-foreground mt-2">JPG, PNG or WEBP (Max 5MB)</p>
              </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 w-full space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">First Name</label>
                  <input
                    {...register("firstName", { required: true })}
                    className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="John"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Last Name</label>
                  <input
                    {...register("lastName", { required: true })}
                    className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Doe"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Email Address <span className="text-muted-foreground font-normal">(Read Only)</span></label>
                  <input
                    {...register("email")}
                    readOnly
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl opacity-70 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Phone Number</label>
                  <input
                    {...register("phoneNumber")}
                    className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="+234 XXX XXXX"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">State</label>
                  <select
                    {...register("state", { required: true })}
                    className="w-full px-4 py-2.5 bg-background text-foreground border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                  >
                    <option value="">Select State</option>
                    {Object.keys(NIGERIAN_STATES).sort().map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">City / LGA</label>
                  <select
                    {...register("city", { required: true })}
                    className="w-full px-4 py-2.5 bg-background text-foreground border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                    disabled={!watchState}
                  >
                    <option value="">Select City</option>
                    {watchState && NIGERIAN_STATES[watchState] ? (
                      NIGERIAN_STATES[watchState].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))
                    ) : (
                      <option disabled>Select a state first</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="px-8 py-2.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>

            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
