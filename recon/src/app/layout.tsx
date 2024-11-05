import "../styles/globals.css"
import { ReactNode } from "react" // Import React types

import NavBar from "@/components/navbar/nav-bar"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <title> Dashboard </title>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Navbar */}
          <NavBar />
          <SidebarProvider>
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
