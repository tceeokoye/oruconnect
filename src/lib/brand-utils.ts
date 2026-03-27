// OruConnect brand color utilities for consistent theming

export const brandColors = {
  light: {
    primary: "#0a1f44",
    secondary: "#12b76a",
    accent: "#f4c430",
    background: "#f8fafc",
    surface: "#ffffff",
    textPrimary: "#0f172a",
    error: "#ef4444",
  },
  dark: {
    primary: "#1e3a8a",
    secondary: "#22c55e",
    accent: "#facc15",
    background: "#020617",
    surface: "#020617",
    textPrimary: "#e5e7eb",
    error: "#f87171",
  },
}

export const statusColors = {
  verified: "text-secondary",
  pending: "text-accent",
  active: "text-secondary",
  inactive: "text-muted-foreground",
  error: "text-destructive",
  warning: "text-accent",
  success: "text-secondary",
}

export const getBgStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    verified: "bg-secondary/10",
    pending: "bg-accent/10",
    active: "bg-secondary/10",
    inactive: "bg-muted",
    error: "bg-destructive/10",
    warning: "bg-accent/10",
    success: "bg-secondary/10",
  }
  return statusMap[status] || "bg-muted"
}

export const getTextStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    verified: "text-secondary",
    pending: "text-accent",
    active: "text-secondary",
    inactive: "text-muted-foreground",
    error: "text-destructive",
    warning: "text-accent",
    success: "text-secondary",
  }
  return statusMap[status] || "text-foreground"
}
