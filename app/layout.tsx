import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"

// Initialize fonts
import { Geist, Geist_Mono } from "next/font/google"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "Producer Tycoon - Создай свою музыкальную империю",
  description:
    "Начни путь от уличного битмейкера до звездного продюсера. Создавай биты, работай с артистами, прокачивай студию и строй музыкальную империю в этой увлекательной игре!",
  generator: "v0.app",
  openGraph: {
    title: "Producer Tycoon - Создай свою музыкальную империю",
    description:
      "Начни путь от уличного битмейкера до звездного продюсера. Создавай биты, работай с артистами и строй музыкальную империю!",
    images: ["/og-image.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Producer Tycoon - Создай свою музыкальную империю",
    description:
      "Начни путь от уличного битмейкера до звездного продюсера. Создавай биты, работай с артистами и строй музыкальную империю!",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/icon.jpg",
    apple: "/icon.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased dark bg-[oklch(0.12_0_0)]">
        <Suspense fallback={null}>
          {children}
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
