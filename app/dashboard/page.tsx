"use client"

import { useEffect, useMemo, useState } from "react"

type Summary = {
  leadsThisWeek: number
  campaignHealth: "Good" | "Warning" | "Critical"
  rankingProgress: string
}

export default function DashboardHome() {
  const [businessName, setBusinessName] = useState<string>("Your Business")
  const summary: Summary = useMemo(
    () => ({ leadsThisWeek: 18, campaignHealth: "Good", rankingProgress: "+12 positions" }),
    []
  )

  useEffect(() => {
    const stored = globalThis?.localStorage?.getItem("omnifiy_profile")
    if (stored) {
      const { businessName } = JSON.parse(stored)
      if (businessName) setBusinessName(businessName)
    }
  }, [])

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Welcome back, {businessName}</h1>
        <p className="mt-1 text-sm text-gray-600">Here’s a quick overview of your campaign performance.</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Leads this week" value={summary.leadsThisWeek.toString()} />
        <Card title="Campaign health" value={summary.campaignHealth} />
        <Card title="Google ranking progress" value={summary.rankingProgress} />
      </div>

      <div className="rounded-lg border border-gray-100 bg-white p-6">
        <h2 className="text-lg font-medium">Next steps</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
          <li>Connect Google Business to unlock local ranking boosts</li>
          <li>Publish your first three service pages</li>
          <li>Invite a teammate to manage leads</li>
        </ul>
      </div>
    </div>
  )
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-6">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  )
}

