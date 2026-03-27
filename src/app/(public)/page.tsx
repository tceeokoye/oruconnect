"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import {
  Search,
  Star,
  CheckCircle,
  Shield,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import LandingPageFeed from "@/components/landing-page-feed";
import { CountUpShort } from "@/components/countUp";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const check = () => setIsMobile(window.innerWidth < breakpoint);
      check();
      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }, [breakpoint]);

    return isMobile;
  }

  const featuredProviders = [
    {
      id: "1",
      name: "ElectroWorks Pro",
      category: "Electrical Services",
      rating: 4.9,
      reviews: 128,
      image: "/electrical-services.jpg",
    },
    {
      id: "2",
      name: "Plumb Masters",
      category: "Plumbing Services",
      rating: 4.8,
      reviews: 95,
      image: "/plumbing-services.png",
    },
    {
      id: "3",
      name: "Interior Design Hub",
      category: "Interior Design",
      rating: 4.9,
      reviews: 156,
      image: "/modern-living-room.png",
    },
  ];

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

  if (!mounted) {
    return (
      <div className="space-y-20">
        <section className="relative overflow-hidden pt-20 pb-32 px-4">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold text-balance leading-tight">
              Find <span className="text-primary">Verified Businesses</span>
              <br />
              You Can Trust
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with verified service providers across Nigeria. Secure,
              escrow-based transactions and transparent ratings.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent -z-10" />

        <motion.div
          className="max-w-5xl mx-auto text-center space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold text-balance leading-tight"
          >
            Find <span className="text-primary">Verified Businesses</span>
            <br />
            You Can Trust
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Connect with verified service providers across Nigeria. Secure,
            escrow-based transactions and transparent ratings.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            variants={itemVariants}
            className="flex gap-2 max-w-2xl mx-auto"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search providers, services, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all duration-200 active:scale-95"
            >
              Search
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-3 gap-6 pt-8 border-t border-border"
          >
            <div className="space-y-1">
              <p className="text-3xl font-bold text-primary">
                <CountUpShort to={50_000} />
              </p>
              <p className="text-muted-foreground">Verified Businesses</p>
            </div>

            <div className="space-y-1">
              <p className="text-3xl font-bold text-secondary">
                <CountUpShort to={200_000} />
              </p>
              <p className="text-muted-foreground">Successful Jobs</p>
            </div>

            <div className="space-y-1">
              <p className="text-3xl font-bold text-accent">
                <CountUpShort to={5_000_000_000} prefix="₦" />
              </p>
              <p className="text-muted-foreground">Value Escrow'd</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Providers */}
      <section className="max-w-7xl mx-auto px-4 space-y-12">
        <motion.div
          className="text-center space-y-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold">Featured Providers</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Highly rated service providers verified and trusted by thousands of
            clients
          </p>
        </motion.div>

        <motion.div className="grid md:grid-cols-3 gap-6">
          {featuredProviders.map((provider) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              whileHover={{
                y: -4,
                scale: 1.02,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
              transition={{ duration: 0.5 }}
              className="group overflow-hidden rounded-xl border border-border bg-card hover:shadow-lg"
            >
              <div className="h-48 bg-gradient-to-br from-muted to-muted/50 overflow-hidden relative">
                <img
                  src={provider.image || "/placeholder.svg"}
                  alt={provider.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold line-clamp-1">
                    {provider.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {provider.category}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(provider.rating)
                            ? "fill-accent text-accent"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">
                    {provider.rating}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({provider.reviews})
                  </span>
                </div>

                <Link
                  href={`/providers/${provider.id}`}
                  className="block text-center py-2 rounded-lg border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-colors active:scale-95"
                >
                  View Profile
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Provider Feed Section */}
      <LandingPageFeed />

      {/* Why OruConnect */}
      <section className="bg-gradient-to-r from-primary/5 to-secondary/5 py-20">
        <div className="max-w-5xl mx-auto px-4 space-y-12">
          <motion.h2
            className="text-4xl font-bold text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Why Choose OruConnect?
          </motion.h2>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-bold">Verified Businesses</h3>
              <p className="text-muted-foreground">
                All service providers are thoroughly vetted with NIN and CAC
                verification
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold">Secure Escrow</h3>
              <p className="text-muted-foreground">
                Your money is held securely until work is completed to your
                satisfaction
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold">Transparent Ratings</h3>
              <p className="text-muted-foreground">
                Real reviews from real clients help you make informed decisions
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center space-y-8">
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands of satisfied clients and service providers on
            OruConnect
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/auth/register"
            className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2 active:scale-95"
          >
            Register Your Business
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/providers"
            className="px-8 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-colors inline-flex items-center justify-center gap-2 active:scale-95"
          >
            Browse Providers
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
