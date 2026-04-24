"use client"

import DashboardHeader from "./DashboardHeader"
import DashboardStats from "./DashboardStats"
import DashboardQuickActions from "./DashboardQuickActions"
import DashboardRecentActivity from "./DashboardRecentActivity"
import DashboardEmptyState from "./DashboardEmptyState"

const stats = [
  {
    label: "Analyses Completed",
    value: "0",
    helper: "Completed sessions will appear here.",
  },
  {
    label: "Saved Sessions",
    value: "0",
    helper: "Store work you want to revisit later.",
  },
  {
    label: "Flagged Moments",
    value: "0",
    helper: "Important signal events will surface here.",
  },
]

const quickActions = [
  {
    title: "Start New Analysis",
    description: "Upload a file and begin a new breakdown.",
    href: "/dashboard/analyze",
  },
  {
    title: "View Past Analysis",
    description: "Return to completed and saved sessions.",
    href: "/past-analysis",
  },
  {
    title: "Explore Community",
    description: "See shared discussions and analysis ideas.",
    href: "/community",
  },
]

const recentActivity = [
  {
    title: "No recent analysis activity yet",
    description: "Once this account starts processing files, recent sessions and actions can be surfaced here.",
    timestamp: "Waiting for first session",
  },
]

export default function DashboardShell() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <DashboardHeader />

        <DashboardStats stats={stats} />

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <DashboardRecentActivity items={recentActivity} />
          <DashboardQuickActions actions={quickActions} />
        </div>

        <DashboardEmptyState />
      </div>
    </main>
  )
}