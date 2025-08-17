export const api = {
  billing: {
    checkAndReserveRun: 'billing.checkAndReserveRun',
  },
  jobs: {
    enqueueCampaign: 'jobs.enqueueCampaign',
    tailEvents: 'jobs.tailEvents',
    appendEvent: 'jobs.appendEvent',
    setStatus: 'jobs.setStatus',
  },
} as const

