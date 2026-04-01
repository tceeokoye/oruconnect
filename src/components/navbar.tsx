"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RootState } from "@/store";
import  logout  from "@/store/slices/auth-slice"
import { ThemeToggle } from "@/components/theme-toggle";
import NotificationBell from "@/components/notification-bell";
import { useEffect } from "react";
import LogoIcon from "@/assets/logo/Artboardwhite.svg"
import LogoText from "@/assets/logo/ORUCONNECT WHITE.svg"
import LogoTextcolored from "@/assets/logo/ORUCONNECT.svg"


import { tokenActions } from "@/store/slices/auth-slice";

import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import Image from "next/image";

export function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
 
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(tokenActions.logout());
    router.push("/");
  };

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const getRoleDisplay = (role: string): string => {
    if (role.endsWith("ADMIN")) {
      return role.replace(/_/g, " ").toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
    }
    const roleMap: Record<string, string> = {
      USER: "Client",
      PROFESSIONAL: "Service Provider",
    };
    return roleMap[role] || role;
  };

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md h-[73px]">
        {/* Empty layout to prevent layout shift before hydration */}
      </nav>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-primary md:hidden flex items-center justify-center text-primary-foreground font-bold">
             < Image src={LogoIcon} alt="logo" height={32} width={24}/>
            </div>
            < Image src={LogoText} alt="logo" height={32} width={153.3}/>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {(user?.role !== "PROFESSIONAL") && (
              <Link
                href="/providers"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Find Providers
              </Link>
            )}
            {(user?.role !== "USER") && (
              <Link
                href="/jobs"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Find Jobs
              </Link>
            )}
            <Link
              href="/categories"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {user?.role === "PROFESSIONAL" ? "Job Categories" : "Categories"}
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About Us
            </Link>
          </div>

          {/* User Area */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {user && <NotificationBell />}

            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {getRoleDisplay(user.role)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const isAdmin = user.role.endsWith("ADMIN");
                    if (isAdmin) {
                      router.push("/admin/dashboard");
                    } else {
                      const dashRoutes: Record<string, string> = {
                        PROFESSIONAL: "/dashboard/provider",
                        USER: "/dashboard/client/jobs",
                      };
                      router.push(dashRoutes[user.role] || "/");
                    }
                  }}
                  className="p-2 flex items-center gap-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="hidden lg:inline">Dashboard</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-primary font-semibold hover:bg-primary/10 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <button onClick={() => setMobileOpen(!mobileOpen)}>
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
              transition={{
                duration: 0.45,
                ease: [0.4, 0.0, 0.2, 1], // material-style smooth easing
              }}
              className="md:hidden overflow-hidden border-t border-border bg-background"
            >
              <div className="p-4 space-y-4">
                {(user?.role !== "PROFESSIONAL") && (
                  <Link
                    href="/providers"
                    className="block text-muted-foreground hover:text-foreground"
                  >
                    Find Providers
                  </Link>
                )}
                {(user?.role !== "USER") && (
                  <Link
                    href="/jobs"
                    className="block text-muted-foreground hover:text-foreground"
                  >
                    Find Jobs
                  </Link>
                )}
                <Link
                  href="/categories"
                  className="block text-muted-foreground hover:text-foreground"
                >
                  {user?.role === "PROFESSIONAL" ? "Job Categories" : "Categories"}
                </Link>
                <Link
                  href="/about"
                  className="block text-muted-foreground hover:text-foreground"
                >
                  About Us
                </Link>

                {user ? (
                  <div className="space-y-3 border-t border-border pt-4">
                    <p className="font-semibold">{user.name}</p>
                    <button
                      onClick={() => {
                        const isAdmin = user.role.endsWith("ADMIN");
                        if (isAdmin) {
                          router.push("/admin/dashboard");
                        } else {
                          const dashRoutes: Record<string, string> = {
                            PROFESSIONAL: "/dashboard/provider",
                            USER: "/dashboard/client/jobs",
                          };
                          router.push(dashRoutes[user.role] || "/");
                        }
                        setMobileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-muted rounded transition-colors"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-muted rounded transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 border-t border-border pt-4">
                    <Link
                      href="/auth/login"
                      className="flex-1 px-4 py-2 text-center text-primary font-semibold border border-primary rounded"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      className="flex-1 px-4 py-2 text-center bg-primary text-white font-semibold rounded"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
