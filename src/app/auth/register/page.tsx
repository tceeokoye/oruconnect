"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  registerSchema,
  type RegisterFormData,
} from "@/lib/validation/schemas";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ClientRegister from "@/components/auth/client-register";
import ProviderRegister from "@/components/auth/provider-register";

const CATEGORIES = [
  { id: "1", name: "Plumbing" },
  { id: "2", name: "Electrical" },
  { id: "3", name: "Carpentry" },
  { id: "4", name: "Cleaning" },
  { id: "5", name: "Consulting" },
  { id: "6", name: "Design" },
];

const SUBCATEGORIES: Record<string, Array<{ id: string; name: string }>> = {
  "1": [
    { id: "1.1", name: "Installation" },
    { id: "1.2", name: "Repair" },
    { id: "1.3", name: "Maintenance" },
  ],
  "2": [
    { id: "2.1", name: "Installation" },
    { id: "2.2", name: "Repair" },
    { id: "2.3", name: "Maintenance" },
  ],
  "3": [
    { id: "3.1", name: "Custom Furniture" },
    { id: "3.2", name: "Renovation" },
    { id: "3.3", name: "Repair" },
  ],
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploads, setUploads] = useState({ nin: false, cac: false });
  const [userType, setUserType] = useState<"client" | "provider" | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");
  const categoryId = watch("categoryId");

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Registration successful! Please verify your email.");
        router.push("/auth/login");
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (userType === null) {
    return (
      <motion.div
        className="space-y-8 w-full pb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => router.push("/")}
          className="mb-6 px-4  text-sm text-primary font-medium hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
           Back to Home
          
        </button>
        <div className="text-center space-y-3">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground">
            Welcome to OruConnect
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose how you'd like to join our platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {/* Client Option */}
          <motion.button
            onClick={() => setUserType("client")}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="border border-border rounded-2xl p-8 text-left hover:border-primary hover:shadow-lg transition-all group"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  I'm Looking to Hire
                </h2>
                <p className="text-muted-foreground mb-4">
                  Browse verified service providers and post jobs to get quotes
                  from trusted professionals.
                </p>
              </div>
              <div className="text-primary font-semibold flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                Continue as Client
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </motion.button>

          {/* Provider Option */}
          <motion.button
            onClick={() => setUserType("provider")}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="border border-primary/50 bg-primary/5 rounded-2xl p-8 text-left hover:border-primary hover:shadow-lg transition-all group"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  I'm a Service Provider
                </h2>
                <p className="text-muted-foreground mb-4">
                  Register your business, get verified, and start receiving jobs
                  from clients across Nigeria.
                </p>
              </div>
              <div className="text-primary font-semibold flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                Register as Provider
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </motion.button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setUserType(null)}
        className="mb-6 px-4 py-2 text-sm text-primary font-medium hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2"
      >
        ← Back to choice
        <ArrowLeft className="w-4 h-4" />
      </button>
      {userType === "client" ? <ClientRegister /> : <ProviderRegister />}
    </div>
  );
}
