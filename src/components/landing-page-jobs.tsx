"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Briefcase, MapPin, Calendar, DollarSign, Clock } from "lucide-react";

interface JobPost {
  id: string;
  title: string;
  description: string;
  budget: number;
  location: string;
  category: string;
  status: string;
  createdAt: string;
  client: {
    firstName: string;
    lastName: string;
  };
}

export default function LandingPageJobs() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs?status=open");
        const data = await response.json();
        if (data.success) {
          setJobs(data.data.slice(0, 6)); // Show latest 6
        }
      } catch (error) {
        console.error("Failed to fetch jobs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-16 px-4 md:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-foreground">
            Available Opportunities
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse tasks and projects posted by clients looking for your expertise. 
            Connect with clients and grow your business.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="h-6 w-3/4 bg-muted rounded"></div>
                <div className="h-4 w-full bg-muted rounded"></div>
                <div className="h-4 w-1/2 bg-muted rounded"></div>
                <div className="pt-4 flex justify-between">
                  <div className="h-8 w-24 bg-muted rounded"></div>
                  <div className="h-8 w-24 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-card/50">
            <Briefcase className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No active job posts at the moment</p>
            <p className="text-sm text-muted-foreground/60 mt-2">Check back later for new opportunities!</p>
          </div>
        ) : (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                className="group flex flex-col bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                      {job.category}
                    </span>
                    <div className="flex items-center gap-1 text-secondary font-bold">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                    {job.title}
                  </h3>

                  <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <DollarSign className="w-4 h-4 text-secondary" />
                      ₦{job.budget?.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary">
                      {job.client?.firstName?.charAt(0)}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      By {job.client?.firstName} {job.client?.lastName}
                    </span>
                  </div>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    Details
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Link
            href="/jobs"
            className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-all flex items-center gap-2 active:scale-95"
          >
            View All Opportunities
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
