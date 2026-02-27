"use client"

import { useEffect, useState } from "react"

const TARGET_DATE = new Date("2026-05-05T09:00:00-07:00")

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(): TimeLeft {
  const now = new Date()
  const diff = TARGET_DATE.getTime() - now.getTime()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function CountdownUnit({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-2 md:gap-3">
      <div
        className={`relative flex items-center justify-center rounded-2xl md:rounded-3xl border border-border/50 w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 ${color}`}
      >
        <span className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs sm:text-sm md:text-base uppercase tracking-[0.2em] text-muted-foreground font-medium">
        {label}
      </span>
    </div>
  )
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        {["Days", "Hours", "Minutes", "Seconds"].map((label) => (
          <CountdownUnit key={label} value={0} label={label} color="bg-card" />
        ))}
      </div>
    )
  }

  const isOver = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0

  if (isOver) {
    return (
      <div className="text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-accent">
          {"It's happening NOW!"}
        </h2>
      </div>
    )
  }

  const colors = [
    "bg-primary/20 text-primary-foreground",
    "bg-secondary/20 text-foreground",
    "bg-accent/20 text-foreground",
    "bg-chart-4/20 text-foreground",
  ]

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
      <CountdownUnit value={timeLeft.days} label="Days" color={colors[0]} />
      <div className="text-3xl sm:text-5xl md:text-7xl font-bold text-muted-foreground self-start mt-5 sm:mt-7 md:mt-10 lg:mt-12">:</div>
      <CountdownUnit value={timeLeft.hours} label="Hours" color={colors[1]} />
      <div className="text-3xl sm:text-5xl md:text-7xl font-bold text-muted-foreground self-start mt-5 sm:mt-7 md:mt-10 lg:mt-12">:</div>
      <CountdownUnit value={timeLeft.minutes} label="Minutes" color={colors[2]} />
      <div className="text-3xl sm:text-5xl md:text-7xl font-bold text-muted-foreground self-start mt-5 sm:mt-7 md:mt-10 lg:mt-12">:</div>
      <CountdownUnit value={timeLeft.seconds} label="Seconds" color={colors[3]} />
    </div>
  )
}
