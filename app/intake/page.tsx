"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type BusinessProfile = {
  businessName: string
  website: string
  targetLocation: string
  email: string
  phone: string
}

export default function IntakePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<BusinessProfile>({
    businessName: "",
    website: "",
    targetLocation: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    const stored = globalThis?.localStorage?.getItem("omnifiy_profile")
    if (stored) setProfile(JSON.parse(stored))
  }, [])

  function update<K extends keyof BusinessProfile>(key: K, value: BusinessProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    localStorage.setItem("omnifiy_profile", JSON.stringify(profile))
    router.push("/dashboard")
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-semibold">Tell us about your business</h1>
        <p className="mt-2 text-sm text-gray-600">We use this to generate your initial campaign.</p>
        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label className="block text-sm font-medium">Business name</label>
            <input
              value={profile.businessName}
              onChange={(e) => update("businessName", e.target.value)}
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
              placeholder="Acme Plumbing Co."
              required
            />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Website</label>
              <input
                value={profile.website}
                onChange={(e) => update("website", e.target.value)}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Target location</label>
              <input
                value={profile.targetLocation}
                onChange={(e) => update("targetLocation", e.target.value)}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
                placeholder="Austin, TX"
                required
              />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => update("email", e.target.value)}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input
                value={profile.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
                placeholder="(555) 555-5555"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-900"
            >
              Generate my campaign
            </button>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">Back</Link>
          </div>
        </form>
      </div>
    </main>
  )
}

