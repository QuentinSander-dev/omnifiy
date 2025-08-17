export default function CampaignStatusPage() {
  const siteUrl = "https://your-business.omnifiy.site"
  const seoPosts = [
    { title: "Best HVAC Services in Austin", date: "2025-07-04" },
    { title: "How Often to Service Your AC", date: "2025-07-01" },
  ]
  const keywords = [
    { term: "hvac austin", position: 9, change: +3 },
    { term: "ac repair austin", position: 15, change: +6 },
    { term: "furnace tune up austin", position: 21, change: +2 },
  ]

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Campaign status</h1>
        <p className="mt-1 text-sm text-gray-600">Track what Omnifiy has generated and how you’re ranking.</p>
      </header>

      <div className="rounded-lg border border-gray-100 bg-white p-6">
        <h2 className="text-lg font-medium">Generated site</h2>
        <a href={siteUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-gray-700 underline">
          {siteUrl}
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-100 bg-white p-6">
          <h3 className="text-lg font-medium">SEO content published</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            {seoPosts.map((p) => (
              <li key={p.title} className="flex items-center justify-between">
                <span>{p.title}</span>
                <span className="text-gray-500">{p.date}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-gray-100 bg-white p-6">
          <h3 className="text-lg font-medium">Keyword tracking</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 font-medium">Keyword</th>
                  <th className="px-4 py-3 font-medium">Position</th>
                  <th className="px-4 py-3 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((k) => (
                  <tr key={k.term} className="border-t border-gray-100">
                    <td className="px-4 py-3">{k.term}</td>
                    <td className="px-4 py-3">{k.position}</td>
                    <td className={"px-4 py-3 " + (k.change >= 0 ? "text-emerald-600" : "text-red-600")}>
                      {k.change >= 0 ? "+" : ""}
                      {k.change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

