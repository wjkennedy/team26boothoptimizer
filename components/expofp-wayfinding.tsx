'use client'

import { useEffect, useRef, useMemo } from 'react'
import { Booth } from '@/lib/distance-utils'

interface ExpoFPWayfindingProps {
  booths?: Booth[]
  waypointIds?: string[]
  autoRoute?: boolean
}

export function ExpoFPWayfinding({
  booths = [],
  waypointIds = [],
  autoRoute = true,
}: ExpoFPWayfindingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const bounds = useMemo(() => {
    if (booths.length === 0) return { minX: 0, maxX: 1000, minY: 0, maxY: 1000 }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    booths.forEach(booth => {
      minX = Math.min(minX, booth.x)
      maxX = Math.max(maxX, booth.x)
      minY = Math.min(minY, booth.y)
      maxY = Math.max(maxY, booth.y)
    })
    return { minX, maxX, minY, maxY }
  }, [booths])

  const scale = useMemo(() => {
    const width = bounds.maxX - bounds.minX || 1
    const height = bounds.maxY - bounds.minY || 1
    return {
      x: 720 / width,
      y: 540 / height,
      offsetX: 40 - bounds.minX,
      offsetY: 30 - bounds.minY,
    }
  }, [bounds])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Background
    ctx.fillStyle = '#fafaf9'
    ctx.fillRect(0, 0, 800, 600)

    // Draw booths
    booths.forEach(booth => {
      const x = (booth.x + scale.offsetX) * scale.x
      const y = (booth.y + scale.offsetY) * scale.y
      const size = booth.size === 'large' ? 12 : booth.size === 'medium' ? 8 : 5

      ctx.fillStyle = '#e7e5e4'
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw booth labels below circles to avoid overlap
    booths.forEach(booth => {
      const x = (booth.x + scale.offsetX) * scale.x
      const y = (booth.y + scale.offsetY) * scale.y
      
      // Booth ID label (bold)
      ctx.fillStyle = '#78716c'
      ctx.font = 'bold 9px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(booth.id, x, y + 16)
      
      // Vendor name or placeholder (with text wrapping if needed)
      ctx.fillStyle = booth.vendor ? '#a8a39d' : '#d6ccc2'
      ctx.font = '8px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      
      const vendorText = booth.vendor || 'TBD'
      const maxWidth = 40
      let displayText = vendorText
      
      if (ctx.measureText(vendorText).width > maxWidth) {
        displayText = vendorText.substring(0, 12) + '...'
      }
      ctx.fillText(displayText, x, y + 26)
    })

    // Draw route path and waypoints
    if (waypointIds.length > 0) {
      const boothMap = new Map(booths.map(b => [b.id, b]))

      ctx.strokeStyle = '#0052cc'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()

      let firstPoint = true
      waypointIds.forEach(id => {
        const booth = boothMap.get(id)
        if (booth) {
          const x = (booth.x + scale.offsetX) * scale.x
          const y = (booth.y + scale.offsetY) * scale.y
          if (firstPoint) {
            ctx.moveTo(x, y)
            firstPoint = false
          } else {
            ctx.lineTo(x, y)
          }
        }
      })
      ctx.stroke()
      ctx.setLineDash([])

      // Draw route waypoints with stop numbers
      waypointIds.forEach((id, idx) => {
        const booth = boothMap.get(id)
        if (booth) {
          const x = (booth.x + scale.offsetX) * scale.x
          const y = (booth.y + scale.offsetY) * scale.y

          ctx.fillStyle = '#0052cc'
          ctx.beginPath()
          ctx.arc(x, y, 6, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 11px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText((idx + 1).toString(), x, y)
        }
      })
    }

    // Border
    ctx.strokeStyle = '#d6ccc2'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, 800, 600)
  }, [booths, waypointIds, scale])

  // Trigger ExpoFP selectRoute when waypoints change
  useEffect(() => {
    if (waypointIds.length > 0 && (window as any).___fp) {
      try {
        console.log('[v0] Calling ExpoFP selectRoute with', waypointIds.length, 'waypoints')
        ;(window as any).___fp.selectRoute(waypointIds.slice(0, 8))
      } catch (error) {
        console.error('[v0] ExpoFP selectRoute error:', error)
      }
    }
  }, [waypointIds])

  return (
    <div className="w-full space-y-4">
      <div className="w-full rounded-lg border border-border overflow-hidden bg-card p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full border border-border rounded"
        />
      </div>
      <div className="text-xs text-muted-foreground text-center p-2">
        <p>
          {waypointIds.length > 0
            ? `Route showing ${waypointIds.length} booths`
            : 'Booth floor plan'}
        </p>
        <p className="text-xs">Blue circles show route order</p>
      </div>
    </div>
  )
}
