"use client";

import type React from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { RootState } from "@/store";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!user || user.role !== "USER") {
      router.push("/auth/login");
    }
  }, [user, router]);

  if (!isMounted || !user) {
    return null;
  }

  return <>{children}</>;
}
