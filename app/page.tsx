import { HeroSection } from '@/components/ui/hero-section-1'

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <HeroSection />

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-2xl font-semibold">How Omnifiy grows your organic traffic</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="text-sm font-semibold text-gray-500">Step 1</div>
              <h3 className="mt-2 text-lg font-medium">Tell us your business and services</h3>
              <p className="mt-2 text-sm text-muted-foreground">Pick locations and offerings. Omnifiy handles keywords, clustering, and content planning.</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="text-sm font-semibold text-gray-500">Step 2</div>
              <h3 className="mt-2 text-lg font-medium">We generate and publish SEO content</h3>
              <p className="mt-2 text-sm text-muted-foreground">AI-written service pages and blogs with schema, internal links, and on-page fixes—automatically.</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="text-sm font-semibold text-gray-500">Step 3</div>
              <h3 className="mt-2 text-lg font-medium">Rank higher while you sleep</h3>
              <p className="mt-2 text-sm text-muted-foreground">Track rankings and traffic. Omnifiy keeps optimizing content and targeting new keywords.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-2xl font-semibold">SEO automation that actually moves rankings</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Auto‑generated blog content', desc: 'Publish optimized articles mapped to real search intent—on autopilot.' },
              { title: 'On‑page SEO audits + fixes', desc: 'Titles, meta, headers, image alts, speed—caught and fixed automatically.' },
              { title: 'Keyword research + clustering', desc: 'Find opportunities, cluster topics, and plan content coverage for you.' },
              { title: 'Internal linking recommendations', desc: 'Build topical authority with automated, relevant internal links.' },
              { title: 'Schema markup', desc: 'Add structured data for services, articles, and local business to win rich results.' },
              { title: 'AI‑written SEO service pages', desc: 'High‑quality, localized service pages with CTA‑ready copy and SEO best practices.' },
            ].map((f) => (
              <div key={f.title} className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-medium">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof placeholder */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-2xl font-semibold">Trusted by local and national teams</h2>
          <p className="mt-4 text-sm text-muted-foreground">Case studies and benchmarks coming soon.</p>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-muted-foreground">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p>© {new Date().getFullYear()} Omnifiy</p>
            <nav className="flex items-center gap-6">
              <a href="#" className="hover:text-foreground">Privacy</a>
              <a href="#" className="hover:text-foreground">Terms</a>
              <a href="#" className="hover:text-foreground">Contact</a>
              <a href="/sign-in" className="hover:text-foreground">Login</a>
            </nav>
          </div>
        </div>
      </footer>
    </main>
  )
}

function PricingSection() {
  return (
    <section id="pricing">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold">Simple, flexible pricing</h2>
            <p className="mt-2 text-sm text-muted-foreground">Set it and grow. No engineers needed.</p>
          </div>
          <BillingToggle />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              name: 'Starter',
              monthly: 49,
              yearly: 39,
              features: ['5 blog posts/mo', '1 on-page site audit', 'Keyword suggestions'],
              cta: 'Start Starter',
            },
            {
              name: 'Growth',
              monthly: 149,
              yearly: 119,
              features: ['15 posts/mo', '3 audits', '1:1 support', 'Internal linking recs'],
              cta: 'Start Growth',
              highlight: true,
            },
            {
              name: 'Agency',
              monthly: 499,
              yearly: 399,
              features: ['Unlimited SEO campaigns', 'Multi-site support', 'Custom workflows'],
              cta: 'Contact Sales',
            },
          ].map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <a href="/intake" className="text-sm font-medium text-muted-foreground underline hover:text-foreground">
            Request a demo
          </a>
        </div>
      </div>
    </section>
  )
}

function BillingToggle() {
  return (
    <form className="inline-flex items-center gap-2 rounded-full border border-border p-1 text-sm">
      <label className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-1 hover:bg-accent hover:text-accent-foreground">
        <input type="radio" name="billing" defaultChecked className="sr-only" />
        <span>Monthly</span>
      </label>
      <label className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-1 hover:bg-accent hover:text-accent-foreground">
        <input type="radio" name="billing" className="sr-only" />
        <span>Yearly</span>
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400">Save</span>
      </label>
    </form>
  )
}

function PricingCard({
  name,
  monthly,
  yearly,
  features,
  cta,
  highlight,
}: {
  name: string
  monthly: number
  yearly: number
  features: string[]
  cta: string
  highlight?: boolean
}) {
  return (
    <div
      className={
        'rounded-xl border p-6 ' +
        (highlight ? 'border-foreground/50 shadow-[0_0_0_3px_rgba(255,255,255,0.08)]' : 'border-border')
      }
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-medium">{name}</h3>
        {highlight && <span className="text-xs font-medium text-muted-foreground">Most popular</span>}
      </div>
      <div className="mt-3">
        <div className="text-3xl font-semibold">${monthly}<span className="text-base font-normal text-muted-foreground">/mo</span></div>
        <div className="text-sm text-muted-foreground">or ${yearly}/mo billed yearly</div>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground/70" />
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <a
          href={name === 'Agency' ? '/contact' : '/campaign'}
          className={
            'inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium ' +
            (highlight ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-border hover:bg-accent hover:text-accent-foreground')
          }
        >
          {cta}
        </a>
      </div>
    </div>
  )
}