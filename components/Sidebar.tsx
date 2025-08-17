"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/campaign", label: "Campaign Status" },
  { href: "/dashboard/settings", label: "Settings" },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="h-full w-64 shrink-0 border-r border-gray-100 bg-white">
      <div className="px-4 py-5">
        <Link href="/" className="text-lg font-semibold">Omnifiy</Link>
      </div>
      <nav className="mt-2 space-y-1 px-2">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "block rounded-md px-3 py-2 text-sm " +
                (active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100")
              }
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

