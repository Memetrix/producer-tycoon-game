import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { ErrorBoundary } from "@/components/error-boundary"

import { Geist, Geist_Mono, Geist as V0_Font_Geist, Geist_Mono as V0_Font_Geist_Mono, Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'
import { Geist, Geist_Mono, Geist as V0_Font_Geist, Geist_Mono as V0_Font_Geist_Mono, Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'

// Initialize fonts
const _geist = V0_Font_Geist({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _sourceSerif_4 = V0_Font_Source_Serif_4({ subsets: ['latin'], weight: ["200","300","400","500","600","700","800","900"] })

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
    images: ["/og-image.webp"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Producer Tycoon - Создай свою музыкальную империю",
    description:
      "Начни путь от уличного битмейкера до звездного продюсера. Создавай биты, работай с артистами и строй музыкальную империю!",
    images: ["/og-image.webp"],
  },
  icons: {
    icon: "/icon.webp",
    apple: "/icon.webp",
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
        <ErrorBoundary>
          <Suspense fallback={null}>
            {children}
            <Analytics />
          </Suspense>
        </ErrorBoundary>
      </body>
    </html>
  )
}
