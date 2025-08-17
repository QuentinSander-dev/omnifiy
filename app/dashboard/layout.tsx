import Sidebar from "@/components/Sidebar"
import { ReactNode } from "react"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <Sidebar />
        <section className="min-h-[80vh] flex-1">
          {children}
        </section>
      </div>
    </main>
  )
}

