"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // alert("Settings saved!");
    }, 1000);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground">
          Manage your system configurations, API keys, and global preferences.
        </p>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold leading-none tracking-tight">Global Metadata</h3>
          <p className="text-sm text-muted-foreground">
            Update the SEO title and description for the public application.
          </p>
        </div>
        <div className="p-6 pt-0">
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform Name</label>
              <Input defaultValue="OruConnect" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Support Email</label>
              <Input type="email" defaultValue="support@oruconnect.com" />
            </div>
            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold leading-none tracking-tight">Financial Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure platform fees and standard escrow withdrawal cycles.
          </p>
        </div>
        <div className="p-6 pt-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform Fee (%)</label>
              <Input type="number" defaultValue="5" />
            </div>
            <Button variant="outline" className="mt-2">Enable Auto-Payouts</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
