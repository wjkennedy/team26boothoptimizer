import { CalendarDays, MapPin, Users } from "lucide-react"

export function EventDetails() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 w-full max-w-3xl mx-auto">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
          <CalendarDays className="h-6 w-6 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Date</p>
          <p className="text-lg font-bold text-foreground">May 5, 2026</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/20">
          <MapPin className="h-6 w-6 text-secondary" />
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Location</p>
          <p className="text-lg font-bold text-foreground">Anaheim, CA</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
          <Users className="h-6 w-6 text-accent" />
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Event</p>
          <p className="text-lg font-bold text-foreground">{"Atlassian Team '26"}</p>
        </div>
      </div>
    </div>
  )
}
