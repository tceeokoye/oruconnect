"use client"

import { motion } from "framer-motion"
import { CheckCircle, Shield, Zap, Users } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent -z-10" />

        <motion.div
          className="max-w-4xl mx-auto text-center space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-bold text-balance leading-tight">
            About <span className="text-primary">OruConnect</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Building trust, one verified business at a time. Africa's most trusted marketplace for verified service
            providers.
          </motion.p>
        </motion.div>
      </section>

      {/* Main Story */}
      <section className="max-w-4xl mx-auto px-4 space-y-8">
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold">
            Our Mission
          </motion.h2>

          <motion.p variants={itemVariants} className="text-lg text-muted-foreground leading-relaxed">
            OruConnect is a trusted Nigerian platform designed to connect individuals and businesses with verified
            service providers across multiple industries. We believe trust is the foundation of every successful service
            relationship.
          </motion.p>

          <motion.p variants={itemVariants} className="text-lg text-muted-foreground leading-relaxed">
            That's why every business on OruConnect goes through a strict verification process before offering services
            to the public. We eliminate uncertainty, reduce fraud, and create a transparent environment where clients
            can confidently hire professionals and businesses they can rely on.
          </motion.p>
        </motion.div>
      </section>

      {/* Vision */}
      <section className="bg-primary/5 py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.h2
            className="text-3xl font-bold text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our Vision
          </motion.h2>

          <motion.p
            className="text-lg text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            OruConnect bridges the gap between service providers and clients by combining verification, secure payments,
            and accountability into one seamless experience. Whether you are a skilled professional, a registered
            company, or a customer seeking quality service, OruConnect is built to protect your interests and help you
            succeed.
          </motion.p>
        </div>
      </section>

      {/* Trust & Verification */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <motion.h2
          className="text-3xl font-bold text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Why Trust OruConnect?
        </motion.h2>

        <motion.div
          className="grid md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants} className="card-premium p-8 space-y-4">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-bold">Strict Verification Process</h3>
            <p className="text-muted-foreground">
              Every service provider undergoes rigorous verification including NIN validation, CAC registration checks,
              and location verification.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="card-premium p-8 space-y-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Secure Escrow System</h3>
            <p className="text-muted-foreground">
              All payments are held in secure escrow until work is completed to your satisfaction, protecting both
              clients and providers.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="card-premium p-8 space-y-4">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-bold">Fast & Reliable</h3>
            <p className="text-muted-foreground">
              Experience quick response times, reliable service delivery, and transparent communication throughout your
              entire project.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="card-premium p-8 space-y-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Community Driven</h3>
            <p className="text-muted-foreground">
              Real reviews from real clients. Our transparent rating system helps you make informed decisions every
              time.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Why Choose OruConnect */}
      <section className="max-w-4xl mx-auto px-4 space-y-8">
        <motion.h2
          className="text-3xl font-bold text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          For Clients
        </motion.h2>

        <motion.div
          className="space-y-4 text-lg text-muted-foreground"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.p variants={itemVariants} className="flex gap-3">
            <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
            <span>Find vetted, verified professionals across all service categories</span>
          </motion.p>
          <motion.p variants={itemVariants} className="flex gap-3">
            <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
            <span>Compare rates, reviews, and ratings to make the best choice</span>
          </motion.p>
          <motion.p variants={itemVariants} className="flex gap-3">
            <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
            <span>Pay securely with guaranteed escrow protection</span>
          </motion.p>
          <motion.p variants={itemVariants} className="flex gap-3">
            <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
            <span>Resolve disputes with transparent mediation</span>
          </motion.p>
        </motion.div>
      </section>

      {/* For Providers */}
      <section className="max-w-4xl mx-auto px-4 space-y-8 mb-20">
        <motion.h2
          className="text-3xl font-bold text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          For Service Providers
        </motion.h2>

        <motion.div
          className="space-y-4 text-lg text-muted-foreground"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.p variants={itemVariants} className="flex gap-3">
            <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
            <span>Build credibility through verified business status</span>
          </motion.p>
          <motion.p variants={itemVariants} className="flex gap-3">
            <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
            <span>Access a steady stream of qualified leads</span>
          </motion.p>
          <motion.p variants={itemVariants} className="flex gap-3">
            <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
            <span>Secure payments with transparent transaction tracking</span>
          </motion.p>
          <motion.p variants={itemVariants} className="flex gap-3">
            <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
            <span>Grow your business with professional tools and analytics</span>
          </motion.p>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-bold">Ready to Join?</h2>
          <p className="text-lg text-muted-foreground">
            Become part of Africa's most trusted marketplace for verified services
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Register Your Business
            </Link>
            <Link
              href="/providers"
              className="px-8 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-colors"
            >
              Browse Providers
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
