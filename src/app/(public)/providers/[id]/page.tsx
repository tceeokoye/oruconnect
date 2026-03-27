"use client"

import { useSelector } from "react-redux"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, MapPin, Star, Shield, Phone, Mail, Globe, MessageCircle, ArrowRight } from "lucide-react"
import { useState, use } from "react"

export default function ProviderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter()
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    budget: "",
    description: "",
    timeline: ""
  })

  const provider = {
    id: resolvedParams.id,
    name: "ElectroWorks Pro",
    description: "Professional electrical services for residential and commercial properties",
    category: "Electrical",
    subcategory: "Installation & Repair",
    state: "Lagos",
    city: "Lagos",
    rating: 4.9,
    reviews: 128,
    verified: true,
    joinedDate: "2023-06-15",
    phone: "+234 800 123 4567",
    email: "contact@electroworks.ng",
    website: "www.electroworks.ng",
    responseTime: "2 hours",
    completionRate: 98,
    image: "/electrical-services.jpg",
    gallery: ["/electrical-work-1.jpg", "/electrical-work-2.jpg", "/electrical-work-3.jpg", "/electrical-work-4.jpg"],
    recentJobs: [
      { title: "House Rewiring", status: "completed", rating: 5 },
      { title: "Solar Panel Installation", status: "completed", rating: 5 },
      { title: "Electrical Maintenance", status: "completed", rating: 4 },
    ],
  }

  const handleInquiry = () => {
    setShowInquiryModal(true)
  }

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API request to category admin
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      setTimeout(() => {
        setShowInquiryModal(false)
        setIsSuccess(false)
        setFormData({ name: "", email: "", phone: "", budget: "", description: "", timeline: "" })
      }, 3000)
    }, 1500)
  }

  return (
    <div className="bg-background">
      {/* Header Navigation */}
      <Link
        href="/providers"
        className="sticky top-20 flex items-center gap-2 text-primary p-4 hover:underline z-40 bg-background/80 backdrop-blur-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Providers
      </Link>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        {/* Profile Header */}
        <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Profile Info */}
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-4xl font-bold">{provider.name}</h1>
                      {provider.verified && <Shield className="w-6 h-6 text-secondary flex-shrink-0" />}
                    </div>
                    <p className="text-lg text-muted-foreground">
                      {provider.category} • {provider.subcategory}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {provider.city}, {provider.state}
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-3 border-t border-border pt-6">
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-bold text-primary">{provider.rating}</div>
                  <div className="space-y-1">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(provider.rating) ? "fill-accent text-accent" : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">Based on {provider.reviews} reviews</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 bg-muted rounded-lg p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{provider.responseTime}</p>
                  <p className="text-xs text-muted-foreground">Response Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{provider.completionRate}%</p>
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">Verified</p>
                  <p className="text-xs text-muted-foreground">
                    Member Since {new Date(provider.joinedDate).getFullYear()}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-lg text-muted-foreground leading-relaxed">{provider.description}</p>
            </div>

            {/* Profile Image & CTA */}
            <motion.div className="space-y-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="rounded-xl overflow-hidden">
                <img
                  src={provider.image || "/placeholder.svg"}
                  alt={provider.name}
                  className="w-full h-80 object-cover"
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleInquiry}
                  className="w-full py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-primary/20 hover:-translate-y-1"
                >
                  <MessageCircle className="w-5 h-5" />
                  Request Service Booking
                </button>
              </div>

              {/* Contact Info */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <p className="text-sm font-semibold">Contact Information</p>
                <a
                  href={`tel:${provider.phone}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Phone className="w-4 h-4" />
                  {provider.phone}
                </a>
                <a
                  href={`mailto:${provider.email}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  {provider.email}
                </a>
                <a
                  href={`https://${provider.website}`}
                  target="_blank"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                  rel="noreferrer"
                >
                  <Globe className="w-4 h-4" />
                  {provider.website}
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Gallery */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold">Gallery</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {provider.gallery.map((image, index) => (
              <motion.div
                key={index}
                className="rounded-lg overflow-hidden cursor-pointer h-48"
                whileHover={{ scale: 1.05 }}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Jobs */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold">Recent Jobs</h2>
          <div className="space-y-3">
            {provider.recentJobs.map((job, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-semibold">{job.title}</p>
                  <p className="text-sm text-muted-foreground capitalize">{job.status}</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < job.rating ? "fill-accent text-accent" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-8 text-center space-y-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold">Ready to Work with {provider.name}?</h2>
          <p className="text-muted-foreground">Send a direct service request to start your project</p>
          <button
            onClick={handleInquiry}
            className="px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20 hover:-translate-y-1 inline-flex items-center gap-2"
          >
            Submit an Inquiry
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !isSubmitting && setShowInquiryModal(false)}
        >
          <motion.div
            className="bg-card rounded-xl max-w-lg w-full p-6 space-y-6 my-8"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-2xl font-bold">Service Inquiry</h2>
              <p className="text-muted-foreground">
                Requesting service from <span className="font-semibold text-foreground">{provider.name}</span>
              </p>
            </div>

            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="py-12 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-green-500">Inquiry Sent Successfully!</h3>
                <p className="text-muted-foreground">The category admin has been notified and will contact you shortly.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold block mb-1">Full Name</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full border border-border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Phone Number</label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full border border-border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="+234..."
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-1">Email Address</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="jane@example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold block mb-1">Estimated Budget</label>
                    <input
                      type="text"
                      value={formData.budget}
                      onChange={e => setFormData({...formData, budget: e.target.value})}
                      className="w-full border border-border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="e.g. 50,000 NGN"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Timeline</label>
                    <select 
                      value={formData.timeline}
                      onChange={e => setFormData({...formData, timeline: e.target.value})}
                      className="w-full border border-border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                    >
                      <option value="">Select Timeline</option>
                      <option value="immediate">Immediately</option>
                      <option value="1_week">Within 1 week</option>
                      <option value="1_month">Within 1 month</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-1">Project Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Briefly describe what you need done..."
                    rows={4}
                    className="w-full border border-border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInquiryModal(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "Submit Inquiry"
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
