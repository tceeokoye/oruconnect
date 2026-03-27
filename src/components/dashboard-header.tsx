"use client"

import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/store"
import { toggleSidebar } from "@/store/slices/ui-slice"
import { ThemeToggle } from "@/components/theme-toggle"
import { Search, Menu } from "lucide-react"
import { NotificationBell } from "@/components/notifications/notification-bell"

export function DashboardHeader() {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-xl shadow-sm px-4 md:px-8 py-4 sticky top-0 z-40 transition-all">
      <div className="flex items-center justify-between gap-4">
        
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => dispatch(toggleSidebar())}
          className="md:hidden p-2 -ml-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-foreground" />
        </button>

        {/* Search Bar - Hidden on very small screens */}
        <div className="hidden sm:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-full hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-muted/50 transition-colors"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          <NotificationBell />
          <ThemeToggle />
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user?.name || "User"} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-primary">{user?.name?.charAt(0) || "U"}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
