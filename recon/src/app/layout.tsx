import "../styles/globals.css"
import { cookies } from "next/headers"
import { ReactNode } from "react"

import NavBar from "@/components/navbar/nav-bar"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"

interface RootLayoutProps {
  children: ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <title> hello world </title>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Navbar */}
          <NavBar />
          <SidebarProvider defaultOpen={defaultOpen}>
            {/* Sidebar */}
            <AppSidebar />

            {/* Main body */}
            {children}
          </SidebarProvider>

          {/* Footer */}
        </ThemeProvider>
      </body>
    </html>
  )
}
