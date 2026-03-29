"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import { Calendar, Briefcase, Clock, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import type { RootState } from "@/store"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function ClientDashboardOverview() {
  const user = useSelector((state: RootState) => state.auth.user)
  const token = useSelector((state: RootState) => state.auth.token)

  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/bookings", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success && data.data) {
          setBookings(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch bookings", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (token) fetchBookings()
  }, [token])

  const upcomingServices = bookings.filter(b => b.status === "CONFIRMED")
  const recentActivity = bookings.slice(0, 5)

  if (!user) {
    return null
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">Client Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your bookings and activities</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Services Section */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.1 }}
        >
          <Card className="h-full border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
               <div className="space-y-1">
                 <CardTitle className="text-2xl font-bold">Upcoming Services</CardTitle>
                 <CardDescription>Your confirmed bookings</CardDescription>
               </div>
               <Calendar className="w-6 h-6 text-primary opacity-80" />
            </CardHeader>
            <CardContent className="mt-4">
               {isLoading ? (
                 <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
               ) : upcomingServices.length === 0 ? (
                 <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                    No confirmed upcoming services.
                 </div>
               ) : (
                 <ul className="space-y-4">
                    {upcomingServices.map((booking) => (
                      <li key={booking.id} className="flex justify-between items-center bg-card p-4 rounded-lg border border-border shadow-sm">
                        <div className="flex items-center space-x-4">
                           <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                             <Briefcase className="w-5 h-5" />
                           </div>
                           <div>
                             <p className="font-semibold text-foreground">{booking.service?.title || "Service Booking"}</p>
                             <p className="text-sm text-muted-foreground flex items-center mt-1">
                               <Clock className="w-3 h-3 mr-1" /> {booking.timeline || new Date(booking.createdAt).toLocaleDateString()}
                             </p>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className="bg-green-500/10 text-green-600 text-xs font-bold px-3 py-1 rounded-full">{booking.status}</span>
                        </div>
                      </li>
                    ))}
                 </ul>
               )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.2 }}
        >
          <Card className="h-full border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
               <div className="space-y-1">
                 <CardTitle className="text-2xl font-bold">Recent Activity</CardTitle>
                 <CardDescription>Your latest booking history</CardDescription>
               </div>
               <FileText className="w-6 h-6 text-primary opacity-80" />
            </CardHeader>
            <CardContent className="mt-4">
               {isLoading ? (
                 <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
               ) : recentActivity.length === 0 ? (
                 <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                    No recent activity yet. Start exploring services!
                 </div>
               ) : (
                 <ul className="space-y-4">
                    {recentActivity.map((activity) => (
                      <li key={activity.id} className="flex justify-between items-center bg-card p-4 rounded-lg border border-border shadow-sm">
                        <div className="flex items-center space-x-4">
                           <div className="w-10 h-10 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-500">
                             <FileText className="w-5 h-5" />
                           </div>
                           <div>
                             <p className="font-semibold text-foreground text-sm">{activity.service?.title || "Booked a Service"}</p>
                             <p className="text-xs text-muted-foreground line-clamp-1">{activity.description}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className={`text-xs font-bold px-2 py-1 rounded-full ${activity.status === "COMPLETED" ? "bg-green-500/10 text-green-600" : activity.status === "PENDING" ? "bg-yellow-500/10 text-yellow-600" : activity.status === "CANCELLED" ? "bg-red-500/10 text-red-600" : "bg-blue-500/10 text-blue-600"}`}>
                             {activity.status}
                           </span>
                           <p className="text-[10px] text-muted-foreground mt-1">{new Date(activity.createdAt).toLocaleDateString()}</p>
                        </div>
                      </li>
                    ))}
                 </ul>
               )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Quick Action */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center mt-10">
         <Link href="/dashboard/client/post-job" className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-full font-semibold transition-transform hover:scale-105">
            Post a New Job
         </Link>
      </motion.div>
    </div>
  )
}
