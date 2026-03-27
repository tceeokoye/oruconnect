"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import type { RootState } from "@/store"
import { toggleSidebar } from "@/store/slices/ui-slice"
import {
  LayoutDashboard,
  Briefcase,
  Wallet,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Search,
  FileText,
} from "lucide-react"
import { logout } from "@/store/slices/auth-slice"
import { useRouter } from "next/navigation"

const PROFESSIONAL_MENU = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/provider" },
  { icon: Search, label: "Explore Jobs", href: "/dashboard/provider/explore" },
  { icon: Briefcase, label: "My Jobs", href: "/dashboard/provider/jobs" },
  { icon: FileText, label: "Portfolio & Posts", href: "/dashboard/provider/posts" },
  { icon: Wallet, label: "Earnings", href: "/dashboard/provider/wallet" },
  { icon: Users, label: "Profile", href: "/dashboard/provider/profile" },
  { icon: MessageSquare, label: "Messages", href: "/dashboard/provider/messages" },
]

const USER_MENU = [
  { icon: LayoutDashboard, label: "My Jobs", href: "/dashboard/client/jobs" },
  { icon: Briefcase, label: "Post a Job", href: "/dashboard/client/post-job" },
  { icon: Search, label: "Find Professionals", href: "/providers" },
  { icon: Wallet, label: "Payments", href: "/dashboard/client/wallet" },
  { icon: Users, label: "Profile", href: "/dashboard/client/profile" },
  { icon: MessageSquare, label: "Messages", href: "/dashboard/client/messages" },
]

const ADMIN_MENU = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: Users, label: "Manage Users", href: "/admin/users" },
  { icon: Briefcase, label: "Manage Bookings", href: "/admin/bookings" },
  { icon: Settings, label: "Platform Settings", href: "/admin/settings" },
]

export function DashboardSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useDispatch()
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen)
  const user = useSelector((state: RootState) => state.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    router.push("/")
  }

  const isAdmin = ["SUPER_ADMIN", "OPERATIONS_ADMIN", "CATEGORY_ADMIN", "CONTENT_ADMIN", "SUPPORT_ADMIN"].includes(user?.role || "");
  const currentMenu = isAdmin 
    ? ADMIN_MENU 
    : user?.role === "PROFESSIONAL" 
      ? PROFESSIONAL_MENU 
      : USER_MENU;

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <motion.aside
        className={`bg-sidebar border-r border-sidebar-border shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-screen flex-col fixed left-0 top-0 z-50 flex ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} transition-transform duration-300 ease-in-out`}
        initial={{ width: 280 }}
        animate={{ width: sidebarOpen ? 280 : 88 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Logo/Brand */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between h-[73px]">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                OC
              </div>
              <h2 className="text-xl font-bold text-primary font-poppins truncate">OruConnect</h2>
            </div>
          )}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors ml-auto"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {currentMenu.map((item) => {
            const Icon = item.icon
            const isActive = pathname ? (pathname === item.href || pathname.startsWith(item.href + "/")) : false

            return (
              <Link key={item.href} href={item.href} onClick={() => window.innerWidth < 768 && dispatch(toggleSidebar())}>
                <motion.div
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm"
                  }`}
                  whileHover={{ x: 4 }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-sidebar-border space-y-3">
          {sidebarOpen && user && (
            <div className="text-xs">
              <p className="font-semibold truncate">{user.name}</p>
              <p className="text-sidebar-foreground/70 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && "Logout"}
          </button>
        </div>
      </motion.aside>
    </>
  )
}
