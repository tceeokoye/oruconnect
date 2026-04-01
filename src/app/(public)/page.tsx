"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

import {
  Search,
  Star,
  CheckCircle,
  Shield,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import LandingPageFeed from "@/components/landing-page-feed";
import LandingPageJobs from "@/components/landing-page-jobs";
import { CountUpShort } from "@/components/countUp";

export default function Home() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  const [featuredProviders, setFeaturedProviders] = useState<any[]>([]);

  // Roles check
  const isGuest = !user;
  const isClient = user?.role === "USER";
  const isProvider = user?.role === "PROFESSIONAL";
  const isAdmin = user && !["USER", "PROFESSIONAL"].includes(user.role);

  useEffect(() => {
    setMounted(true);
    const fetchFeatured = async () => {
      try {
        const response = await fetch("/api/providers?limit=3");
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          setFeaturedProviders(data.data);
        } else {
          // Fallback placeholders if DB is empty
          setFeaturedProviders([
            {
              id: "1",
              name: "Professional Home Cleaning",
              category: "Cleaning Services",
              rating: 4.8,
              reviews: 124,
              image: "https://images.unsplash.com/photo-1581578731548-c64695cc6954?auto=format&fit=crop&q=80&w=800",
            },
            {
              id: "2",
              name: "Elite Web Solutions",
              category: "IT & Development",
              rating: 4.9,
              reviews: 89,
              image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
            },
            {
              id: "3",
              name: "Express Legal Consulting",
              category: "Legal Services",
              rating: 4.7,
              reviews: 56,
              image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800",
            }
          ]);
        }
      } catch (error) {
        console.error("Failed to load featured providers", error);
      }
    };
    fetchFeatured();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/providers?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-4 bg-background">
        <motion.div
          className="max-w-4xl mx-auto text-center space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold tracking-tight text-primary"
          >
            Find Verified Businesses. <span className="text-secondary">Trusted Results.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Nigeria's most trusted marketplace for verified service providers. 
            Connect with the best using our secure escrow system.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto items-stretch"
          >
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="What service do you need?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-14 pr-6 py-3 bg-white border text-black/50 border-border rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg font-medium outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-10 py-3 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-md hover:shadow-xl active:scale-95"
            >
              Search
            </button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-12"
          >
            <div className="space-y-1">
              <p className="text-3xl font-bold text-primary">
                <CountUpShort to={50_000} />+
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Verified Pros</p>
            </div>

            <div className="space-y-1">
              <p className="text-3xl font-bold text-secondary">
                <CountUpShort to={200_000} />+
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Jobs Done</p>
            </div>

            <div className="space-y-1 hidden md:block">
              <p className="text-3xl font-bold text-accent">
                <CountUpShort to={5_000_000_000} prefix="₦" />
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Escrow'd Safely</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Conditional Content Sections */}
      
      {/* 1. Providers Section: Shown for Guests, Clients, and Admins */}
      {(isGuest || isClient || isAdmin) && (
        <>
          {/* Featured Providers */}
          <section className="py-24 max-w-7xl mx-auto px-4 space-y-16">
            <motion.div
              className="text-center space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full uppercase mb-2">Featured Talents</div>
              <h2 className="text-4xl md:text-5xl font-extrabold">Top-Rated Professionals</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                Connect with Elite service providers who have undergone rigorous 
                NIN and CAC verification to ensure your peace of mind.
              </p>
            </motion.div>

            <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProviders.map((provider, index) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-2xl transition-all duration-300"
                >
                  <div className="h-56 overflow-hidden relative">
                    <img
                      src={provider.image || "/placeholder.svg"}
                      alt={provider.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 animate-bounce">
                      <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg">
                        <CheckCircle className="w-5 h-5 text-secondary" />
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="space-y-3">
                      <div className="text-sm font-bold text-primary uppercase tracking-wider">{provider.category}</div>
                      <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                        {provider.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between py-2 border-y border-border/50">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-5 h-5 fill-accent text-accent" />
                        <span className="text-lg font-bold">{provider.rating}</span>
                        <span className="text-sm text-muted-foreground font-medium">({provider.reviews} reviews)</span>
                      </div>
                    </div>

                    <Link
                      href={isGuest ? "/auth/login?redirect=/providers/" + provider.id : `/providers/${provider.id}`}
                      className="flex items-center justify-center w-full py-4 rounded-xl bg-primary/5 text-primary font-bold hover:bg-primary hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/10 active:scale-95"
                    >
                      {isGuest ? "Login to View Profile" : "View Excellence"}
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* Provider Feed Section */}
          <div className="bg-muted/50 py-10">
            <LandingPageFeed />
          </div>
        </>
      )}

      {/* 2. Clients Section: Shown for Guests, Providers, and Admins */}
      {(isGuest || isProvider || isAdmin) && (
        <div className="bg-background">
           <LandingPageJobs />
        </div>
      )}

      {/* Multi-Section Logic for Non-Logged In users or Admins means they see both as split sections. 
          Provider sees ONLY Jobs. 
          Client sees ONLY Providers. 
      */}


      {/* Why OruConnect - Common for everyone */}
      <section className="bg-primary py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
        
        <div className="max-w-6xl mx-auto px-4 relative z-10 space-y-16 text-white text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Crafted for Trust & Scale</h2>
            <p className="text-primary-foreground/70 max-w-2xl mx-auto text-lg leading-relaxed">
              We've built more than a marketplace. We've built an ecosystem where 
              Nigerians can trade services without fear.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-10"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mb-8 mx-auto">
                <CheckCircle className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Strict Verification</h3>
              <p className="text-white/60 leading-relaxed font-medium">
                Every business undergoes a multilayered verification process including 
                NIN, CAC, and bank document review.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-8 mx-auto">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Bulletproof Escrow</h3>
              <p className="text-white/60 leading-relaxed font-medium">
                Our Monnify-powered escrow service holds funds securely, ensuring 
                payment is only released when you're 100% satisfied.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-8 mx-auto">
                <TrendingUp className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Scale Globally</h3>
              <p className="text-white/60 leading-relaxed font-medium">
                Work with local talents who meet global standards. We empower 
                businesses to scale through quality collaboration.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-32 text-center relative">
        <div className="absolute inset-0 bg-secondary/5 rounded-[4rem] -z-10" />
        
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="space-y-4">
            <h2 className="text-5xl font-black tracking-tight leading-tight">
              {isAdmin ? (
                <>Welcome Back, <span className="text-primary underline decoration-secondary">System Admin</span></>
              ) : (
                <>Ready to Join the <br /> 
                <span className="text-primary underline decoration-secondary">Nigerian Commerce Revolution?</span></>
              )}
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium">
              {isAdmin 
                ? "You are logged in with administrative privileges. Access the control center to manage the platform."
                : "Join 250,000+ businesses and clients currently building the future of local commerce on OruConnect."
              }
            </p>
          </div>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {isAdmin ? (
              <Link
                href="/admin/dashboard"
                className="group flex items-center gap-3 px-12 py-5 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all hover:shadow-2xl hover:shadow-primary/30 active:scale-95"
              >
                Go to Admin Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="group flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all hover:shadow-2xl hover:shadow-primary/30 active:scale-95"
                >
                  Start Your Business
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link
                  href="/providers"
                  className="group flex items-center gap-3 px-10 py-5 border-2 border-primary text-primary rounded-2xl font-bold text-lg hover:bg-primary hover:text-white transition-all active:scale-95 shadow-xl shadow-primary/5"
                >
                  Explore Talents
                  <ArrowRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                </Link>
              </>
            )}
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
