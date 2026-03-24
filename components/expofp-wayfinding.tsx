'use client'

import { useMemo } from 'react'
import { Booth } from '@/lib/distance-utils'

interface ExpoFPWayfindingProps {
  booths?: Booth[]
  waypointIds?: string[] // Booth IDs showing the route
  autoRoute?: boolean // Auto-calculate optimized route
}

export function ExpoFPWayfinding({
  booths = [],
  waypointIds = [],
  autoRoute = true,
}: ExpoFPWayfindingProps) {
  // Calculate bounds for scaling
  const bounds = useMemo(() => {
    if (booths.length === 0) return { minX: 0, maxX: 1000, minY: 0, maxY: 1000 }
    
    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity
    
    booths.forEach(booth => {
      minX = Math.min(minX, booth.x)
      maxX = Math.max(maxX, booth.x)
      minY = Math.min(minY, booth.y)
      maxY = Math.max(maxY, booth.y)
    })
    
    return { minX, maxX, minY, maxY }
  }, [booths])

  // Scale coordinates to fit in the canvas
  const scale = useMemo(() => {
    const width = bounds.maxX - bounds.minX || 1
    const height = bounds.maxY - bounds.minY || 1
    const canvasWidth = 800
    const canvasHeight = 600
    
    return {
      x: (canvasWidth * 0.9) / width,
      y: (canvasHeight * 0.9) / height,
      offsetX: (canvasWidth * 0.05) + Math.abs(bounds.minX),
      offsetY: (canvasHeight * 0.05) + Math.abs(bounds.minY),
    }
  }, [bounds])

  // Draw canvas
  const handleCanvasDraw = (ctx: CanvasRenderingContext2D) => {
    const canvasWidth = 800
    const canvasHeight = 600
    
    // Background
    ctx.fillStyle = '#fafaf9'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    
    // Draw all booths
    booths.forEach(booth => {
      const x = (booth.x + scale.offsetX) * scale.x
      const y = (booth.y + scale.offsetY) * scale.y
      const size = booth.size === 'large' ? 12 : booth.size === 'medium' ? 8 : 5
      
      ctx.fillStyle = '#e7e5e4'
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
      
      // Label
      ctx.fillStyle = '#78716c'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(booth.id, x, y)
    })
    
    // Draw route path
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
      
      // Draw route waypoints
      waypointIds.forEach((id, idx) => {
        const booth = boothMap.get(id)
        if (booth) {
          const x = (booth.x + scale.offsetX) * scale.x
          const y = (booth.y + scale.offsetY) * scale.y
          
          ctx.fillStyle = '#0052cc'
          ctx.beginPath()
          ctx.arc(x, y, 6, 0, Math.PI * 2)
          ctx.fill()
          
          // Draw stop number
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
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight)
  }

  return (
    <div className="w-full space-y-4">
      <div className="w-full rounded-lg border border-border overflow-hidden bg-card p-4">
        <canvas
          width={800}
          height={600}
          className="w-full border border-border rounded"
          ref={canvas => {
            if (canvas) {
              const ctx = canvas.getContext('2d')
              if (ctx) {
                handleCanvasDraw(ctx)
              }
            }
          }}
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
