"use client"

import { useEffect, useState } from "react"

type Settings = {
  businessName: string
  website: string
  targetLocation: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({ businessName: "", website: "", targetLocation: "" })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const profile = globalThis?.localStorage?.getItem("omnifiy_profile")
    if (profile) {
      const { businessName, website, targetLocation } = JSON.parse(profile)
      setSettings({ businessName: businessName || "", website: website || "", targetLocation: targetLocation || "" })
    }
  }, [])

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((s) => ({ ...s, [key]: value }))
  }

  function save() {
    const existing = globalThis?.localStorage?.getItem("omnifiy_profile")
    const parsed = existing ? JSON.parse(existing) : {}
    localStorage.setItem("omnifiy_profile", JSON.stringify({ ...parsed, ...settings }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function regenerate() {
    // Stub: pretend we are regenerating, then notify the user
    alert("Regenerating campaign with latest settings…")
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">Manage your business details and campaign preferences.</p>
      </header>

      <div className="rounded-lg border border-gray-100 bg-white p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Business name</label>
            <input
              value={settings.businessName}
              onChange={(e) => update("businessName", e.target.value)}
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
              placeholder="Acme Plumbing Co."
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Website</label>
            <input
              value={settings.website}
              onChange={(e) => update("website", e.target.value)}
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Target location</label>
            <input
              value={settings.targetLocation}
              onChange={(e) => update("targetLocation", e.target.value)}
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
              placeholder="Austin, TX"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button onClick={save} className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-900">
            Save changes
          </button>
          <button onClick={regenerate} className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-50">
            Regenerate campaign
          </button>
          {saved && <span className="text-sm text-emerald-600">Saved!</span>}
        </div>
      </div>
    </div>
  )
}

