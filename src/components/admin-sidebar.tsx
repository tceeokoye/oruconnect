"use client"

import Link from "next/link"
import Image from "next/image"
import LogoIcon from "@/assets/logo/Artboardwhite.svg"
import LogoTextWhite from "@/assets/logo/ORUCONNECT WHITE.svg"
import LogoTextColor from "@/assets/logo/ORUCONNECT.svg"
import { usePathname } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import type { RootState } from "@/store"
import { toggleSidebar } from "@/store/slices/ui-slice"
import {
  LayoutDashboard,
  CheckCircle,
  AlertCircle,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  BarChart3,
  FileText,
  FilePlus2 as FilePost,
  CreditCard,
} from "lucide-react"
import { logout } from "@/store/slices/auth-slice"
import { useRouter } from "next/navigation"

const SUPER_ADMIN_MENU = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: CheckCircle, label: "Verify Businesses", href: "/admin/verifications" },
  { icon: AlertCircle, label: "Disputes", href: "/admin/disputes" },
  { icon: FilePost, label: "Post Moderation", href: "/admin/posts" },
  { icon: Users, label: "Admin Management", href: "/admin/admins" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: CreditCard, label: "Withdrawals", href: "/admin/withdrawals" },
  { icon: FileText, label: "Categories", href: "/admin/categories" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
]

const SUB_ADMIN_MENU = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/sub" },
  { icon: CheckCircle, label: "Pending Reviews", href: "/admin/sub/reviews" },
  { icon: Users, label: "Assigned Businesses", href: "/admin/sub/businesses" },
  { icon: AlertCircle, label: "Reports", href: "/admin/sub/reports" },
  { icon: Settings, label: "Settings", href: "/admin/sub/settings" },
]

const ADMIN_MENU = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: CheckCircle, label: "Verify Businesses", href: "/admin/verifications" },
  { icon: AlertCircle, label: "Disputes", href: "/admin/disputes" },
  { icon: FilePost, label: "Post Moderation", href: "/admin/posts" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: CreditCard, label: "Withdrawals", href: "/admin/withdrawals" },
  { icon: FileText, label: "Categories", href: "/admin/categories" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
]

export function AdminSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useDispatch()
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen)
  const user = useSelector((state: RootState) => state.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    router.push("/")
  }

  const getMenuItems = () => {
    // We map the strictly typed Prisma Roles
    if (user?.role === "SUPER_ADMIN") return SUPER_ADMIN_MENU
    if (user?.role === "OPERATIONS_ADMIN") return SUB_ADMIN_MENU
    return ADMIN_MENU
  }

  const menuItems = getMenuItems()

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
        className={`bg-sidebar border-r border-sidebar-border h-screen flex flex-col fixed md:sticky top-0 left-0 z-50 overflow-hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} transition-transform duration-300 ease-in-out`}
        initial={{ width: 280 }}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo/Brand */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between h-[73px]">
          {sidebarOpen && (
            <Link href="/" className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                  <Image src={LogoIcon} alt="logo" height={32} width={24}/>
                </div>
                <div className="dark:hidden block">
                  <Image src={LogoTextColor} alt="OruConnect Logo" height={24} width={115}/>
                </div>
                <div className="hidden dark:block">
                  <Image src={LogoTextWhite} alt="OruConnect Logo" height={24} width={115}/>
                </div>
              </div>
              <p className="text-xs text-muted-foreground ml-10">{user?.role.replace(/_/g, " ")}</p>
            </Link>
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
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname ? (pathname === item.href || pathname.startsWith(item.href + "/")) : false

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                  whileHover={{ x: 4 }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  {isActive && <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary" />}
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
              <p className="text-sidebar-foreground/70 truncate capitalize">{user.role.replace(/_/g, " ")}</p>
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
