"use client"

import type React from "react"
import { useSelector, useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { RootState } from "@/store"
import { AdminSidebar } from "@/components/admin-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { toggleSidebar } from "@/store/slices/ui-slice"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (!user || !user.role.endsWith("ADMIN")) {
      router.push("/auth/login")
    }
  }, [user, router])

  useEffect(() => {
    if (!isMounted) return

    const handleResize = () => {
      // Use 1024 as lg breakpoint
      if (window.innerWidth < 1024 && sidebarOpen) {
        dispatch(toggleSidebar())
      }
    }

    // Check on initial mount
    if (window.innerWidth < 1024 && sidebarOpen) {
      dispatch(toggleSidebar())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMounted, sidebarOpen, dispatch])

  if (!isMounted || !user) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
