"use client"

import type React from "react"
import { useSelector, useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { logout } from "@/store/slices/auth-slice"
import axios from "axios"
import { toast } from "sonner"
import type { RootState } from "@/store"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"

export default function DashboardLayout({
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
    if (!user) {
      router.push("/auth/login")
    }

    // Global interceptor to force-logout users if their Auth Token expires or DB drops (401/403)
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          toast.error("Session expired or unauthorized. Please log in again.");
          dispatch(logout());
          router.push("/auth/login");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [user, router, dispatch])

  if (!isMounted || !user) {
    return null
  }

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar />
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out relative ${
          sidebarOpen ? "md:pl-[280px]" : "md:pl-[88px]"
        }`}
      >
        <DashboardHeader />
        <main className="flex-1 relative">{children}</main>
      </div>
    </div>
  )
}
