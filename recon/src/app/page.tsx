import * as React from "react"

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import DemoPage from "@/components/table/page"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function Home() {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <DemoPage />
      </SidebarProvider>
    </>
  )
}
