"use client"

import type React from "react"
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { RootState } from "@/store"
import { AdminSidebar } from "@/components/admin-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"

export default function SubAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const user = useSelector((state: RootState) => state.auth.user)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (!user || (user.role !== "sub_admin" && user.role !== "super_admin")) {
      router.push("/auth/login")
    }
  }, [user, router])

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
