"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RootState } from "@/store";
import { tokenActions } from "@/store/slices/auth-slice";
import { ThemeToggle } from "@/components/theme-toggle";
import { useIsMobile } from "@/hook/use-responsive";
import { 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard,
  ChevronDown,
  Home,
  Users,
  Folders,
  Info,
  Phone,
} from "lucide-react";

export function NavbarResponsive() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  const user = useSelector((state: RootState) => state.auth.user);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    dispatch(tokenActions.logout());
    router.push("/");
  };

  const getRoleDisplay = (role: string): string => {
    const roleMap: Record<string, string> = {
      client: "Client",
      provider: "Service Provider",
      admin: "Admin",
      super_admin: "Super Admin",
      sub_admin: "Sub Admin",
    };
    return roleMap[role] || role;
  };

  if (!mounted) return null;

  const getDashboardRoute = () => {
    if (!user) return "/";
    const routes: Record<string, string> = {
      provider: "/dashboard",
      admin: "/admin/dashboard",
      super_admin: "/admin/dashboard",
      sub_admin: "/admin/dashboard",
      client: "/dashboard/client/jobs",
    };
    return routes[user.role] || "/";
  };

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Find Providers", href: "/providers", icon: Users },
    { label: "Categories", href: "/categories", icon: Folders },
    { label: "About Us", href: "/about", icon: Info },
  ];

  return (
    <>
      {/* Main Navbar */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {/* Desktop and Mobile Header */}
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex-shrink-0 text-xl sm:text-2xl font-bold text-primary font-poppins hover:opacity-80 transition-opacity"
            >
              Oru<span className="text-secondary">Connect</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Desktop User Area */}
            <div className="hidden md:flex items-center gap-2 sm:gap-4">
              <ThemeToggle />

              {user ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {getRoleDisplay(user.role)}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(getDashboardRoute())}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Dashboard"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link
                    href="/auth/login"
                    className="px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-3 py-2 text-sm bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden overflow-hidden mt-4 border-t border-border pt-4"
              >
                <div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          pathname === item.href
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}

                  <div className="border-t border-border my-3 pt-3">
                    {user ? (
                      <div className="space-y-2">
                        <div className="px-4 py-2">
                          <p className="font-semibold text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {getRoleDisplay(user.role)}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            router.push(getDashboardRoute());
                            setMobileOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm font-medium">Dashboard</span>
                        </button>
                        <button
                          onClick={() => {
                            handleLogout();
                            setMobileOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm font-medium">Logout</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Link
                          href="/auth/login"
                          className="flex-1 px-3 py-2 text-center text-sm font-semibold text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors"
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/auth/register"
                          className="flex-1 px-3 py-2 text-center text-sm bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Register
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </>
  );
}
