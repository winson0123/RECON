import "../styles/globals.css"
import { ReactNode } from "react" // Import React types
import { ThemeProvider } from "@/components/theme-provider"
import NavBar from "@/components/navbar/nav-bar"

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
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

          {/* Main body */}
          {children}

          {/* Footer */}
        </ThemeProvider>
      </body>
    </html>
  )
}
