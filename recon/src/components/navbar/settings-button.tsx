"use client";

import * as React from "react";
import { SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SettingsButton() {
  const router = useRouter()
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <SettingsIcon className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push('/data/upload')}>Add Data</DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/data/manage')}>Manage Data</DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
