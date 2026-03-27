"use client"

import { useState, useRef, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, Save, X, Loader2, ChevronDown, Search, Check } from "lucide-react"
import { toast } from "sonner"
import { NIGERIAN_STATES } from "@/lib/constants/nigerian-states"
import type { RootState } from "@/store"
import { setUser } from "@/store/slices/auth-slice"

const SelectDropdown = ({
  isOpen,
  onClose,
  title,
  options,
  value,
  onChange,
  searchable = true
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  searchable?: boolean;
}) => {
  const [search, setSearch] = useState("");
  const filtered = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

  // Reset search when opened
  useEffect(() => {
    if (isOpen) setSearch("");
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Invisible overlay to precisely catch outside clicks */}
          <div className="fixed inset-0 z-40" onClick={onClose} />
          
          {/* Absolutely positioned dropdown anchored below the input wrapper via relatively positioned parent! */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0 }}
            className="absolute left-0 top-full w-full z-50 bg-card max-h-[320px] flex flex-col rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-border overflow-hidden"
          >
            {searchable && (
              <div className="p-2 border-b border-border sticky top-0 bg-card/95 backdrop-blur-md z-10 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <input 
                    type="text" 
                    autoFocus
                    placeholder={`Search ${title.toLowerCase()}...`} 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
              {filtered.length === 0 ? (
               <div className="p-6 text-center text-muted-foreground text-sm">No results found</div>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      onChange(opt);
                      onClose();
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between group ${
                      value === opt 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <span>{opt}</span>
                    {value === opt && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check className="w-4 h-4 text-primary" />
                      </motion.div>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function ProfilePage() {
  const user = useSelector((state: RootState) => state.auth.user)
  const token = useSelector((state: RootState) => state.auth.token)
  const dispatch = useDispatch()
  const nameParts = user?.name ? user.name.split(" ") : ["", ""]
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  // Custom Dropdown States
  const [isStateOpen, setIsStateOpen] = useState(false)
  const [isCityOpen, setIsCityOpen] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" ") || "",
    businessName: "",
    description: "",
    phone: "",
    email: user?.email || "",
    website: "",
    state: "",
    city: "",
  })

  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/provider/profile", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success && data.data) {
          setFormData(prev => ({
            ...prev,
            ...data.data
          }))
        }
      } catch (error) {
        console.error("Failed to fetch profile", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (token) fetchProfile()
  }, [token])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const uploadData = new FormData()
    uploadData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      })

      const data = await response.json()
      if (data.success && data.data?.url) {
        setPreviewImage(data.data.url)
        toast.success("Image uploaded successfully!")
      } else {
        toast.error("Failed to upload image")
      }
    } catch (error) {
      toast.error("An error occurred during upload")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/provider/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          profileImage: previewImage || user?.profileImage,
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Profile saved successfully!")
        if (user) {
          // Update local DB and header instantly
          dispatch(setUser({
            ...user,
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            profileImage: previewImage || user.profileImage
          }))
        }
        setIsEditing(false)
      } else {
        toast.error(data.message || "Failed to save profile")
      }
    } catch (error) {
      toast.error("An error occurred while saving")
    } finally {
      setIsSaving(false)
    }
  }

  const currentProfileImage = previewImage || user?.profileImage

  return (
    <div className="p-6 space-y-6">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold">Business Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your public business information</p>
        </div>

        <button
          onClick={() => {
            if (isEditing) setPreviewImage(null) // reset preview on cancel
            setIsEditing(!isEditing)
          }}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            isEditing ? "bg-destructive text-white hover:bg-destructive/90" : "border border-border hover:bg-muted"
          }`}
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4 inline mr-2" />
              Cancel
            </>
          ) : (
            "Edit Profile"
          )}
        </button>
      </motion.div>

      <motion.div
        className="bg-card border border-border rounded-xl p-6 space-y-6 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Profile Picture */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold overflow-hidden relative group shrink-0">
            {currentProfileImage ? (
              <img src={currentProfileImage} alt={user?.name || "Provider"} className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name ? user.name.charAt(0) : "P"}</span>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            )}
          </div>

          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

          {isEditing && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Camera className="w-4 h-4 shrink-0" />
              Change Photo
            </button>
          )}
        </div>

        {/* Form Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              disabled={!isEditing}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              disabled={!isEditing}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Business Description</label>
            <textarea
              value={formData.description}
              disabled={!isEditing}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              disabled={!isEditing}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-2">State</label>
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsStateOpen(!isStateOpen)}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-left bg-background hover:bg-muted/50 transition-colors flex justify-between items-center"
                >
                  <span className={formData.state ? "text-foreground" : "text-muted-foreground"}>
                    {formData.state || "Select state..."}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isStateOpen ? "rotate-180" : ""}`} />
                </button>
                <SelectDropdown
                  isOpen={isStateOpen}
                  onClose={() => setIsStateOpen(false)}
                  title="State"
                  options={Object.keys(NIGERIAN_STATES)}
                  value={formData.state}
                  onChange={(val) => setFormData({ ...formData, state: val, city: "" })}
                />
              </>
            ) : (
              <input
                type="text"
                value={formData.state || "Not provided"}
                disabled
                className="w-full px-4 py-2.5 border border-border rounded-lg disabled:opacity-50"
              />
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-2">City</label>
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsCityOpen(!isCityOpen)}
                  disabled={!formData.state}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-left bg-background hover:bg-muted/50 transition-colors flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className={formData.city ? "text-foreground" : "text-muted-foreground"}>
                    {formData.city || (formData.state ? "Select city..." : "Select state first")}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isCityOpen ? "rotate-180" : ""}`} />
                </button>
                {formData.state && (
                  <SelectDropdown
                    isOpen={isCityOpen}
                    onClose={() => setIsCityOpen(false)}
                    title="City"
                    options={(NIGERIAN_STATES as Record<string, string[]>)[formData.state] || []}
                    value={formData.city}
                    onChange={(val) => setFormData({ ...formData, city: val })}
                  />
                )}
              </>
            ) : (
              <input
                type="text"
                value={formData.city || "Not provided"}
                disabled
                className="w-full px-4 py-2.5 border border-border rounded-lg disabled:opacity-50"
              />
            )}
          </div>
        </div>

        {isEditing && (
          <motion.button
            onClick={handleSave}
            disabled={isSaving || isUploading}
            className="w-full mt-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </motion.button>
        )}
      </motion.div>

      {/* Verification Status (Read Only) */}
      <motion.div
        className="bg-card border border-border rounded-xl p-6 space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-bold">Verification Status</h2>

        <div className="space-y-3">
          {[
            { label: "Email Verified", status: user?.email ? "verified" : "pending" },
            { label: "Business Approved", status: user?.verified ? "verified" : "pending" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm">{item.label}</span>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  item.status === "verified" ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"
                }`}
              >
                {item.status === "verified" ? "✓ Verified" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
