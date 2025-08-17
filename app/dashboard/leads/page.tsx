"use client"

import { useMemo } from "react"

type Lead = {
  id: string
  name: string
  contact: string
  source: string
  score: number
  status: "New" | "Contacted" | "Closed"
}

export default function LeadsPage() {
  const leads: Lead[] = useMemo(
    () => [
      { id: "1", name: "Jane Cooper", contact: "jane@example.com", source: "Google", score: 86, status: "New" },
      { id: "2", name: "Wade Warren", contact: "(555) 341-9942", source: "Organic", score: 72, status: "Contacted" },
      { id: "3", name: "Robert Fox", contact: "rob@example.com", source: "Search", score: 91, status: "Closed" },
      { id: "4", name: "Jenny Wilson", contact: "jenny@example.com", source: "Google", score: 64, status: "New" },
    ],
    []
  )

  function exportCsv() {
    const headers = ["Name", "Contact", "Source", "Lead Score", "Status"]
    const rows = leads.map((l) => [l.name, l.contact, l.source, l.score.toString(), l.status])
    const csv = [headers, ...rows].map((r) => r.map(escapeCsv).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "leads.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="mt-1 text-sm text-gray-600">New leads, contact info, and statuses.</p>
        </div>
        <button onClick={exportCsv} className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900">
          Export CSV
        </button>
      </header>

      <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Contact info</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Lead score</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{lead.name}</td>
                <td className="px-4 py-3 text-gray-600">{lead.contact}</td>
                <td className="px-4 py-3">{lead.source}</td>
                <td className="px-4 py-3">{lead.score}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium " +
                      (lead.status === "New"
                        ? "bg-emerald-50 text-emerald-700"
                        : lead.status === "Closed"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-amber-50 text-amber-700")
                    }
                  >
                    {lead.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes("\n") || value.includes('"')) {
    return '"' + value.replaceAll('"', '""') + '"'
  }
  return value
}

