import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "StudyFlow - Smart Study Management",
  description:
    "AI-powered study management system designed for all students. Track time, manage tasks, and boost productivity with intelligent insights.",
  keywords: "study, productivity, time management, students, focus, learning, education, tasks, analytics",
  authors: [{ name: "StudyFlow Team" }],
  creator: "StudyFlow",
  publisher: "StudyFlow",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://studyflow.app",
    title: "StudyFlow - Smart Study Management",
    description: "AI-powered study management for students. Track time, manage tasks, boost productivity.",
    siteName: "StudyFlow",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudyFlow - Smart Study Management",
    description: "AI-powered study management for students.",
  },
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
