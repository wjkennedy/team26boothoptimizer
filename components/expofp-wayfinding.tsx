'use client'

import { useCallback, useEffect, useRef, useMemo } from 'react'
import { Booth } from '@/lib/distance-utils'

interface ExpoFPWayfindingProps {
  booths?: Booth[]
  waypointIds?: string[]
  autoRoute?: boolean
}

// Canvas dimensions.
// PAD accounts for: circle radius (max 10) + badge (9) + ID text (11px) + vendor text (10px)
// plus generous breathing room so nothing is ever cropped at any edge.
const CANVAS_W = 1000
const CANVAS_H = 720
const PAD_X = 120
const PAD_Y = 120

function buildScale(
  booths: Booth[],
  w: number,
  h: number,
  padX: number,
  padY: number,
) {
  if (booths.length === 0) return { x: 1, y: 1, offX: 0, offY: 0 }
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  booths.forEach(b => {
    if (b.x < minX) minX = b.x
    if (b.x > maxX) maxX = b.x
    if (b.y < minY) minY = b.y
    if (b.y > maxY) maxY = b.y
  })
  return {
    x: (w - padX * 2) / (maxX - minX || 1),
    y: (h - padY * 2) / (maxY - minY || 1),
    offX: padX - minX,
    offY: padY - minY,
  }
}

function drawMap(
  ctx: CanvasRenderingContext2D,
  booths: Booth[],
  waypointIds: string[],
  w: number,
  h: number,
  scale: { x: number; y: number; offX: number; offY: number },
  dpr = 1,
) {
  const toC = (bx: number, by: number) => ({
    cx: (bx + scale.offX) * scale.x,
    cy: (by + scale.offY) * scale.y,
  })

  const boothMap = new Map(booths.map(b => [b.id, b]))
  const routeSet = new Set(waypointIds)

  // ── Background ────────────────────────────────────────────────
  ctx.fillStyle = '#f5f5f4'
  ctx.fillRect(0, 0, w, h)

  // ── All booths ────────────────────────────────────────────────
  booths.forEach(b => {
    const { cx, cy } = toC(b.x, b.y)
    const r = b.size === 'large' ? 10 : b.size === 'medium' ? 7 : 4

    ctx.fillStyle = routeSet.has(b.id) ? '#dbeafe' : '#e7e5e4'
    ctx.strokeStyle = routeSet.has(b.id) ? '#93c5fd' : '#d4d0cc'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Booth ID
    ctx.fillStyle = '#78716c'
    ctx.font = `bold ${8 * dpr}px ui-sans-serif, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(b.id, cx, cy + r + 3)

    // Vendor label
    const vendorLabel = b.vendor || 'TBD'
    ctx.font = `${7 * dpr}px ui-sans-serif, system-ui, sans-serif`
    const maxW = 54 * dpr
    const label = ctx.measureText(vendorLabel).width > maxW
      ? vendorLabel.slice(0, 10) + '\u2026'
      : vendorLabel
    ctx.fillStyle = b.vendor ? '#a8a29e' : '#d6d3d1'
    ctx.fillText(label, cx, cy + r + 13)
  })

  // ── Route path ────────────────────────────────────────────────
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
      const { cx, cy } = toC(b.x, b.y)
      if (first) { ctx.moveTo(cx, cy); first = false } else ctx.lineTo(cx, cy)
    }
    ctx.stroke()
    ctx.setLineDash([])
  }

  // ── Numbered badges ───────────────────────────────────────────
  waypointIds.forEach((id, idx) => {
    const b = boothMap.get(id)
    if (!b) return
    const { cx, cy } = toC(b.x, b.y)

    ctx.fillStyle = '#1d4ed8'
    ctx.beginPath()
    ctx.arc(cx, cy, 9, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${idx + 1 > 9 ? 7 : 8}px ui-sans-serif, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(idx + 1), cx, cy)
  })

  // ── Border ────────────────────────────────────────────────────
  ctx.strokeStyle = '#e7e5e4'
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1)
}

export function ExpoFPWayfinding({
  booths = [],
  waypointIds = [],
}: ExpoFPWayfindingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const scale = useMemo(
    () => buildScale(booths, CANVAS_W, CANVAS_H, PAD_X, PAD_Y),
    [booths],
  )

  // Draw preview canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawMap(ctx, booths, waypointIds, CANVAS_W, CANVAS_H, scale)
  }, [booths, waypointIds, scale])

  // Export at 2× resolution
  const handleExport = useCallback(() => {
    const DPR = 2
    const exportW = CANVAS_W * DPR
    const exportH = CANVAS_H * DPR

    const offscreen = document.createElement('canvas')
    offscreen.width = exportW
    offscreen.height = exportH

    const ctx = offscreen.getContext('2d')
    if (!ctx) return

    // Scale context so all coordinates stay the same — drawMap just gets bigger pixels
    ctx.scale(DPR, DPR)

    // Build scale at export dimensions with matching padding
    const exportScale = buildScale(booths, CANVAS_W, CANVAS_H, PAD_X, PAD_Y)
    drawMap(ctx, booths, waypointIds, CANVAS_W, CANVAS_H, exportScale, DPR)

    offscreen.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `team26-booth-route.png`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
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
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {waypointIds.length > 0
            ? `${waypointIds.length} booths in route — numbered in visit order`
            : 'Route will appear once booths are loaded'}
        </p>
        <button
          onClick={handleExport}
          disabled={waypointIds.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-card/80 text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Export map as PNG"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export PNG
        </button>
      </div>
    </div>
  )
}
