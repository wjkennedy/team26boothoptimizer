import { CountdownTimer } from "@/components/countdown-timer"
import { AnimatedParticles } from "@/components/animated-particles"
import { EventDetails } from "@/components/event-details"
import { HeroBadge } from "@/components/hero-badge"
import Link from "next/link"
import Image from "next/image"

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

        {/* A9 SightGlass Sponsor Section - Marketplace Style Card */}
        <div className="w-full max-w-md mx-auto mt-4">
          <div className="relative overflow-hidden rounded-lg border border-border bg-card p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            {/* Header with logo */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-base font-bold text-foreground">A9 SightGlass</h3>
                <p className="text-xs text-muted-foreground mt-0.5">AI-Powered Insights for Jira</p>
              </div>
              <div className="flex-shrink-0">
                <Image
                  src="/a9-logo.png"
                  alt="A9 SightGlass"
                  width={40}
                  height={40}
                  className="rounded-md"
                />
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-foreground/80">
              Join Marketplace Data with the Team &apos;26 event map sponsored by A9 Consulting Group. Powerful analytics for your Atlassian systems.
            </p>

            {/* Promo offer */}
            <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/20 space-y-1">
              <div className="text-xs font-semibold text-primary">First 25 users get 20% off annual subscription</div>
              <div className="text-xs text-muted-foreground">Less than $1 per user for even the smallest teams</div>
              <code className="text-sm font-mono font-bold text-primary block">
                Code: NAOV9L
              </code>
            </div>

            {/* CTA Button */}
            <Link
              href="https://marketplace.atlassian.com/apps/3606666578/a9-sightglass?tab=overview"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <span>View on Marketplace</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
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

        <a
          href="/booth-optimizer?tab=marketplace"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-card/80 hover:border-primary/50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0 0h6m-6-6V3m0 0v3" />
          </svg>
          <span>Browse Exhibitors&apos; Marketplace</span>
        </a>

        <p className="text-xs text-muted-foreground/60 tracking-wide">
          May 5, 2026 &middot; Anaheim Convention Center
        </p>
      </div>
    </main >
  )
}
