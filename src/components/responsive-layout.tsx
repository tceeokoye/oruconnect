"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

/**
 * Responsive container component
 * Provides proper padding and max-width for different screen sizes
 */
export function ResponsiveContainer({
  children,
  className,
  size = "lg",
}: ResponsiveContainerProps) {
  const sizeClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-5xl",
    xl: "max-w-6xl",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Responsive grid component
 */
interface ResponsiveGridProps {
  children: ReactNode;
  columns?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function ResponsiveGrid({
  children,
  columns = { default: 1, md: 2, lg: 3 },
  gap = "md",
  className,
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: "gap-3 sm:gap-4",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8",
  };

  const gridClass = `grid grid-cols-${columns.default} ${
    columns.sm ? `sm:grid-cols-${columns.sm}` : ""
  } ${columns.md ? `md:grid-cols-${columns.md}` : ""} ${
    columns.lg ? `lg:grid-cols-${columns.lg}` : ""
  } ${columns.xl ? `xl:grid-cols-${columns.xl}` : ""} ${
    gapClasses[gap]
  }`;

  return (
    <div className={cn(gridClass, className)}>
      {children}
    </div>
  );
}

/**
 * Responsive flex component
 */
interface ResponsiveFlexProps {
  children: ReactNode;
  direction?: "row" | "col";
  justify?: "start" | "center" | "between" | "end";
  items?: "start" | "center" | "end" | "stretch";
  gap?: "sm" | "md" | "lg";
  wrap?: boolean;
  responsive?: boolean;
  className?: string;
}

export function ResponsiveFlex({
  children,
  direction = "row",
  justify = "start",
  items = "center",
  gap = "md",
  wrap = false,
  responsive = false,
  className,
}: ResponsiveFlexProps) {
  const gapClasses = {
    sm: "gap-2 sm:gap-3",
    md: "gap-3 sm:gap-4",
    lg: "gap-4 sm:gap-6",
  };

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    between: "justify-between",
    end: "justify-end",
  };

  const itemClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  const directionClass = responsive
    ? `flex-col sm:flex-${direction}`
    : `flex-${direction}`;

  return (
    <div
      className={cn(
        "flex",
        directionClass,
        justifyClasses[justify],
        itemClasses[items],
        gapClasses[gap],
        wrap && "flex-wrap",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Stack component for vertical layouts
 */
interface ResponsiveStackProps {
  children: ReactNode;
  gap?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function ResponsiveStack({
  children,
  gap = "md",
  className,
}: ResponsiveStackProps) {
  const gapClasses = {
    sm: "space-y-2 sm:space-y-3",
    md: "space-y-3 sm:space-y-4",
    lg: "space-y-4 sm:space-y-6",
    xl: "space-y-6 sm:space-y-8",
  };

  return <div className={cn(gapClasses[gap], className)}>{children}</div>;
}

/**
 * Section component with responsive padding
 */
interface ResponsiveSectionProps {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

export function ResponsiveSection({
  children,
  className,
  padded = true,
}: ResponsiveSectionProps) {
  return (
    <section
      className={cn(
        padded && "py-8 sm:py-12 md:py-16 lg:py-20",
        className
      )}
    >
      {children}
    </section>
  );
}
