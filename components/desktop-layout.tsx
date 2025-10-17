"use client"

import type { ReactNode } from "react"

interface DesktopLayoutProps {
  children: ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  className?: string
}

export function DesktopLayout({ children, maxWidth = "2xl", className = "" }: DesktopLayoutProps) {
  const maxWidthClasses = {
    sm: "lg:max-w-2xl",
    md: "lg:max-w-4xl",
    lg: "lg:max-w-5xl",
    xl: "lg:max-w-6xl",
    "2xl": "lg:max-w-7xl",
    full: "lg:max-w-full",
  }

  return (
    <div className={`w-full bg-background lg:pl-64 ${className}`}>
      <div className={`mx-auto bg-background ${maxWidthClasses[maxWidth]} lg:px-8 lg:py-6`}>{children}</div>
    </div>
  )
}
