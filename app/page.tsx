import { CountdownTimer } from "@/components/countdown-timer"
import { AnimatedParticles } from "@/components/animated-particles"
import { EventDetails } from "@/components/event-details"
import { HeroBadge } from "@/components/hero-badge"

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

        <a
          href="https://www.atlassian.com/company/events/team"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/25 active:scale-100"
        >
          <span className="relative z-10">Learn More</span>
          <svg
            className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
          <span className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] opacity-0 transition-opacity group-hover:opacity-100 group-hover:animate-[shimmer_2s_linear_infinite]" />
        </a>

        <p className="text-xs text-muted-foreground/60 tracking-wide">
          May 5, 2026 &middot; Anaheim Convention Center
        </p>
      </div>
    </main>
  )
}
