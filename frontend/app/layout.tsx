import "./globals.css"
import type { Metadata } from "next"
import LandingNavbar from "@/app/components/LandingNavbar"

export const metadata: Metadata = {
  title: "AudioAnalyzer",
  description: "AI-powered audio intelligence platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white antialiased overflow-x-hidden">
        <div className="relative min-h-screen flex flex-col">

          {/* Global Background System */}
          <div className="absolute inset-0 -z-10 overflow-hidden">

            <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-blue-600/20 blur-[140px] rounded-full" />

            <div className="absolute top-[40%] right-[-200px] w-[700px] h-[700px] bg-indigo-600/15 blur-[140px] rounded-full" />

            <div className="absolute bottom-[-200px] left-[-200px] w-[800px] h-[800px] bg-purple-600/10 blur-[160px] rounded-full" />

          </div>

          <LandingNavbar />

          <main className="flex-1">{children}</main>

          <footer className="border-t border-zinc-800 text-center text-xs text-zinc-500 py-6">
            © {new Date().getFullYear()} AudioAnalyzer. All rights reserved.
          </footer>

        </div>
      </body>
    </html>
  )
}