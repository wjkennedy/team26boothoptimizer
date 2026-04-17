'use client'

import { useCallback, useEffect, useRef, useMemo, useState } from 'react'
import { Booth } from '@/lib/distance-utils'

type LayerMode = 'combined' | 'route-only' | 'map-only'

interface ExpoFPWayfindingProps {
  booths?: Booth[]
  waypointIds?: string[]
  autoRoute?: boolean
  onBoothClick?: (booth: Booth) => void
}

// Canvas dimensions.
// PAD accounts for: circle radius (max 10) + badge (9) + ID text (11px) + vendor text (10px)
// plus generous breathing room so nothing is ever cropped at any edge.
const CANVAS_W = 1000
const CANVAS_H = 720
const PAD_X = 150
const PAD_Y = 150

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
  layerMode: LayerMode = 'combined',
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
  const boothsToShow = layerMode === 'route-only' 
    ? booths.filter(b => routeSet.has(b.id))
    : booths

  boothsToShow.forEach(b => {
    const { cx, cy } = toC(b.x, b.y)
    const r = b.size === 'large' ? 10 : b.size === 'medium' ? 7 : 4

    ctx.fillStyle = routeSet.has(b.id) ? '#dbeafe' : '#e7e5e4'
    ctx.strokeStyle = routeSet.has(b.id) ? '#93c5fd' : '#d4d0cc'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Booth ID - larger and bolder
    ctx.fillStyle = '#1f2937'
    ctx.font = `bold ${10 * dpr}px ui-sans-serif, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(b.id, cx, cy + r + 4)

    // Vendor label - slightly larger with better contrast
    const vendorLabel = b.vendor || 'TBD'
    ctx.font = `500 ${8 * dpr}px ui-sans-serif, system-ui, sans-serif`
    const maxW = 60 * dpr
    const metrics = ctx.measureText(vendorLabel)
    let label = vendorLabel
    if (metrics.width > maxW) {
      label = vendorLabel.slice(0, 12) + '\u2026'
    }
    ctx.fillStyle = b.vendor ? '#6b7280' : '#d1d5db'
    ctx.fillText(label, cx, cy + r + 17)
  })

  // ── Route path ────────────────────────────────────────────────
  if (waypointIds.length > 1 && (layerMode === 'combined' || layerMode === 'route-only')) {
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
  if (layerMode === 'combined' || layerMode === 'route-only') {
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
  }

  // ── Border ────────────────────────────────────────────────────
  ctx.strokeStyle = '#e7e5e4'
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1)
}

export function ExpoFPWayfinding({
  booths = [],
  waypointIds = [],
  onBoothClick,
}: ExpoFPWayfindingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [layerMode, setLayerMode] = useState<LayerMode>('combined')

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
    drawMap(ctx, booths, waypointIds, CANVAS_W, CANVAS_H, scale, layerMode)
  }, [booths, waypointIds, scale, layerMode])

  // Hit-test a canvas click against booth positions
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onBoothClick || booths.length === 0) return
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    // Scale mouse coords from display size to canvas logical size
    const scaleX = CANVAS_W / rect.width
    const scaleY = CANVAS_H / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY

    for (const b of booths) {
      const cx = (b.x + scale.offX) * scale.x
      const cy = (b.y + scale.offY) * scale.y
      const r = (b.size === 'large' ? 10 : b.size === 'medium' ? 7 : 4) + 4 // generous hit radius
      const dx = mx - cx
      const dy = my - cy
      if (dx * dx + dy * dy <= r * r) {
        onBoothClick(b)
        return
      }
    }
  }, [booths, onBoothClick, scale])

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
    // Always export combined view
    drawMap(ctx, booths, waypointIds, CANVAS_W, CANVAS_H, exportScale, 'combined', DPR)

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
    <div className="w-full space-y-3">
      {/* Layer selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground">Layer:</span>
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {[
            { mode: 'combined' as LayerMode, label: 'Full Map + Route' },
            { mode: 'route-only' as LayerMode, label: 'Route Only' },
            { mode: 'map-only' as LayerMode, label: 'Map Only' },
          ].map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setLayerMode(mode)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                layerMode === mode
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full rounded-lg border border-border overflow-hidden bg-card">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className={`w-full ${onBoothClick ? 'cursor-pointer' : ''}`}
          aria-label="Booth route map"
          onClick={handleCanvasClick}
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
