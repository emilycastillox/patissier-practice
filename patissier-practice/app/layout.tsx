import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { FavoritesProvider } from "@/lib/contexts/FavoritesContext"
import { ProgressProvider } from "@/lib/contexts/ProgressContext"
import { ReviewProvider } from "@/lib/contexts/ReviewContext"
import { LearningPathProvider } from "@/lib/contexts/LearningPathContext"
import "./globals.css"

export const metadata: Metadata = {
  title: "Patissier Practice - Master the Art of Pastry",
  description: "AI-powered learning platform for baking and pastry techniques",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <FavoritesProvider>
          <ProgressProvider>
            <ReviewProvider>
              <LearningPathProvider>
                <Suspense fallback={null}>{children}</Suspense>
                <Analytics />
              </LearningPathProvider>
            </ReviewProvider>
          </ProgressProvider>
        </FavoritesProvider>
      </body>
    </html>
  )
}
