// import * as React from "react"

// import { Footer } from "@/components/nav/footer"
// import { Header } from "@/components/nav/header"

// interface LandingLayoutProps {
//   children: React.ReactNode
// }

// export default function LandingLayout({
//   children,
// }: LandingLayoutProps): JSX.Element {
//   return (
//     <div className="flex flex-col overflow-hidden">
//       <Header />
//       <main className="flex-1">{children}</main>
//       <Footer />
//     </div>
//   )
// }

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"

import { Navbar } from "@/components/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SophieAI - Resume Builder & Document Center",
  description: "Create, refine, or optimize your resume with AI assistance",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
