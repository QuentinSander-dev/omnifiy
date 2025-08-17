import { ConvexHttpClient } from "convex/browser"
import { createClient } from "convex/server"
import { api } from "@/convex/_generated/api"

const CONVEX_URL = process.env.CONVEX_URL!
if (!CONVEX_URL) throw new Error("Missing CONVEX_URL")

export const convex = new ConvexHttpClient(CONVEX_URL)
export const convexServer = createClient(CONVEX_URL)
export { api }

