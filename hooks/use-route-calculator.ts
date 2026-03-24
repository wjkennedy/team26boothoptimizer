'use client'

import { useState, useCallback } from 'react'
import { Booth, RouteResult } from '@/lib/distance-utils'
import {
  calculateSerpentineRoute,
  calculateBigToSmallRoute,
  calculateQuestMotivatedRoute,
  calculateExpofpOptimizedRoute,
} from '@/lib/distance-utils'

export type StrategyType = 'serpentine' | 'big-to-small' | 'quest' | 'expofp'

interface UseRouteCalculatorProps {
  booths: Booth[]
}

export function useRouteCalculator({ booths }: UseRouteCalculatorProps) {
  const [strategy, setStrategy] = useState<StrategyType>('serpentine')
  const [route, setRoute] = useState<RouteResult | null>(null)

  const calculateRoute = useCallback(
    (selectedStrategy: StrategyType) => {
      let result: RouteResult

      switch (selectedStrategy) {
        case 'serpentine':
          result = calculateSerpentineRoute(booths)
          break
        case 'big-to-small':
          result = calculateBigToSmallRoute(booths)
          break
        case 'quest':
          result = calculateQuestMotivatedRoute(booths)
          break
        case 'expofp':
          result = calculateExpofpOptimizedRoute(booths)
          break
        default:
          result = calculateSerpentineRoute(booths)
      }

      setStrategy(selectedStrategy)
      setRoute(result)
    },
    [booths]
  )

  // Calculate initial route on mount or when booths change
  const initializeRoute = useCallback(() => {
    calculateRoute('serpentine')
  }, [calculateRoute])

  return {
    strategy,
    route,
    calculateRoute,
    initializeRoute,
  }
}
