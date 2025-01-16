"use client";

import { HeaderScriptManager } from "../header-script-manager";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function HeaderScriptsPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Header Script Manager</h1>
        <HeaderScriptManager />
      </div>
    </DashboardLayout>
  );
} 