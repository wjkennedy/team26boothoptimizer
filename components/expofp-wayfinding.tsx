'use client'

import { useEffect, useRef, useMemo } from 'react'
import { Booth } from '@/lib/distance-utils'

interface ExpoFPWayfindingProps {
  booths?: Booth[]
  waypointIds?: string[]
  autoRoute?: boolean
}

const CANVAS_W = 900
const CANVAS_H = 600
const PAD = 40

export function ExpoFPWayfinding({
  booths = [],
  waypointIds = [],
}: ExpoFPWayfindingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Derive scale from booth coordinates
  const scale = useMemo(() => {
    if (booths.length === 0) return { x: 1, y: 1, offX: 0, offY: 0 }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    booths.forEach(b => {
      if (b.x < minX) minX = b.x
      if (b.x > maxX) maxX = b.x
      if (b.y < minY) minY = b.y
      if (b.y > maxY) maxY = b.y
    })
    const rangeX = maxX - minX || 1
    const rangeY = maxY - minY || 1
    return {
      x: (CANVAS_W - PAD * 2) / rangeX,
      y: (CANVAS_H - PAD * 2) / rangeY,
      offX: PAD - minX,
      offY: PAD - minY,
    }
  }, [booths])

  const toCanvas = (bx: number, by: number) => ({
    cx: (bx + scale.offX) * scale.x,
    cy: (by + scale.offY) * scale.y,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // ── Background ──────────────────────────────────────────────
    ctx.fillStyle = '#f5f5f4'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    const boothMap = new Map(booths.map(b => [b.id, b]))
    const routeSet = new Set(waypointIds)

    // ── All booths (background dots) ────────────────────────────
    booths.forEach(b => {
      const { cx, cy } = toCanvas(b.x, b.y)
      const r = b.size === 'large' ? 10 : b.size === 'medium' ? 7 : 4

      // Circle
      ctx.fillStyle = routeSet.has(b.id) ? '#dbeafe' : '#e7e5e4'
      ctx.strokeStyle = routeSet.has(b.id) ? '#93c5fd' : '#d4d0cc'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Booth ID below circle
      ctx.fillStyle = '#78716c'
      ctx.font = 'bold 8px ui-sans-serif, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(b.id, cx, cy + r + 2)

      // Vendor name or placeholder
      const vendorLabel = b.vendor || 'TBD'
      const maxW = 52
      let label = vendorLabel
      ctx.font = '7px ui-sans-serif, system-ui, sans-serif'
      if (ctx.measureText(vendorLabel).width > maxW) {
        label = vendorLabel.slice(0, 10) + '\u2026'
      }
      ctx.fillStyle = b.vendor ? '#a8a29e' : '#d6d3d1'
      ctx.fillText(label, cx, cy + r + 12)
    })

    // ── Route path (dotted line) ─────────────────────────────────
    if (waypointIds.length > 1) {
      ctx.strokeStyle = '#2563eb'
      ctx.lineWidth = 2
      ctx.setLineDash([6, 5])
      ctx.lineJoin = 'round'
      ctx.beginPath()
      let first = true
      for (const id of waypointIds) {
        const b = boothMap.get(id)
        if (!b) continue
        const { cx, cy } = toCanvas(b.x, b.y)
        if (first) { ctx.moveTo(cx, cy); first = false } else ctx.lineTo(cx, cy)
      }
      ctx.stroke()
      ctx.setLineDash([])
    }

    // ── Waypoint numbered badges ─────────────────────────────────
    waypointIds.forEach((id, idx) => {
      const b = boothMap.get(id)
      if (!b) return
      const { cx, cy } = toCanvas(b.x, b.y)
      const badge = 9

      ctx.fillStyle = '#1d4ed8'
      ctx.beginPath()
      ctx.arc(cx, cy, badge, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${idx + 1 > 9 ? 7 : 8}px ui-sans-serif, system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(idx + 1), cx, cy)
    })

    // ── Border ───────────────────────────────────────────────────
    ctx.strokeStyle = '#e7e5e4'
    ctx.lineWidth = 1
    ctx.strokeRect(0.5, 0.5, CANVAS_W - 1, CANVAS_H - 1)
  }, [booths, waypointIds, scale])

  return (
    <div className="w-full space-y-2">
      <div className="w-full rounded-lg border border-border overflow-hidden bg-card">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full"
          aria-label="Booth route map"
        />
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {waypointIds.length > 0
          ? `${waypointIds.length} booths in route — numbered in visit order`
          : 'Route will appear once booths are loaded'}
      </p>
    </div>
  )
}
