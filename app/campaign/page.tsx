"use client"
import { useState } from 'react'
import { RunCampaignForm } from '../../components/RunCampaignForm'
import { RunLogPanel } from '../../components/RunLogPanel'
import { ProgressBar } from '../../components/ProgressBar'

export default function CampaignPage() {
  const [jobId, setJobId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<string | undefined>(undefined)
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Run SEO Campaign</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <RunCampaignForm onStart={setJobId} />
        <div className="space-y-4">
          <ProgressBar current={currentStep} />
          {jobId ? (
            <>
              <RunLogPanel jobId={jobId} onStepChange={setCurrentStep} />
              <div>
                <a className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90" href={`/api/proof?jobId=${jobId}`} target="_blank" rel="noopener noreferrer">Download Proof Pack (.json)</a>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">Submit the form to start streaming logs and progress here.</div>
          )}
        </div>
      </div>
    </main>
  )
}

