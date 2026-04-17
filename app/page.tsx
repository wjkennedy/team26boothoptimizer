import { CountdownTimer } from "@/components/countdown-timer"
import { AnimatedParticles } from "@/components/animated-particles"
import { EventDetails } from "@/components/event-details"
import { HeroBadge } from "@/components/hero-badge"
import Link from "next/link"

export default function Page() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      <AnimatedParticles />

      {/* Decorative glow blobs */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
        style={{ backgroundColor: "oklch(0.55 0.2 260)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-40 -bottom-40 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
        style={{ backgroundColor: "oklch(0.75 0.18 195)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full opacity-10 blur-[100px]"
        style={{ backgroundColor: "oklch(0.82 0.17 85)" }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 md:gap-12">
        <HeroBadge />

        <div className="text-center">
          <h1 className="text-balance text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-foreground leading-[1.05]">
            Atlassian Team{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {"'26"}
            </span>
          </h1>
          <p className="mt-3 md:mt-4 text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Anaheim, California
          </p>
        </div>

        <CountdownTimer />

        <EventDetails />

        {/* A9 SightGlass Sponsor Section */}
        <div className="w-full max-w-md mx-auto mt-4">
          <div className="relative rounded-xl overflow-hidden border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-6 space-y-4 shadow-lg">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #3b82f6, transparent 40%)" }} />
            <div className="relative z-10 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Powered by A9 SightGlass</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered insights for Atlassian. Get exclusive Team &apos;26 pricing!
                </p>
              </div>
              
              <div className="bg-background/40 rounded-lg p-3 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-2">Promo Code:</p>
                <code className="text-sm font-mono font-bold text-primary bg-background px-3 py-2 rounded inline-block">
                  NAOV9L
                </code>
              </div>

              <div className="flex gap-2">
                <Link
                  href="https://marketplace.atlassian.com/apps/3606666578/a9-sightglass?tab=overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <span>View A9 SightGlass</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>

              <p className="text-xs text-muted-foreground/70 text-center">
                Set up your visit with marketplace data courtesy of A9 Consulting Group
              </p>
            </div>
          </div>
        </div>

        <a
          href="/booth-optimizer"
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-accent px-8 py-4 text-base font-bold text-accent-foreground transition-all hover:scale-105 hover:shadow-lg hover:shadow-accent/25 active:scale-100"
        >
          <span className="relative z-10">Plan Your Route</span>
          <svg
            className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
          <span className="absolute inset-0 bg-gradient-to-r from-accent via-secondary to-accent bg-[length:200%_100%] opacity-0 transition-opacity group-hover:opacity-100 group-hover:animate-[shimmer_2s_linear_infinite]" />
        </a>

        <p className="text-xs text-muted-foreground/60 tracking-wide">
          May 5, 2026 &middot; Anaheim Convention Center
        </p>
      </div>
    </main>
  )
}
