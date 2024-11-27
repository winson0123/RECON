import "../styles/globals.css"
import { ReactNode } from "react"

import StoreProvider from "./storeProvider"

import NavBar from "@/components/navbar/nav-bar"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <StoreProvider>
      <html lang="en" suppressHydrationWarning className="h-full">
        <head />
        <title> Dashboard </title>
        <body className="h-full">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Navbar */}
            <NavBar />

            {/* Main body */}
            {children}
            <Toaster />

            {/* Footer */}
          </ThemeProvider>
        </body>
      </html>
    </StoreProvider>
  )
}
