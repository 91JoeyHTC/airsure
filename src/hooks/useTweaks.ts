import { useState, useCallback } from 'react'

type TweakValue = string | string[] | number

interface TweakState {
  [key: string]: TweakValue
}

export function useTweaks<T extends TweakState>(defaults: T): [T, (key: keyof T, value: TweakValue) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem('as-tweaks')
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults
    } catch {
      return defaults
    }
  })

  const setTweak = useCallback((key: keyof T, value: TweakValue) => {
    setState(prev => {
      const next = { ...prev, [key]: value }
      localStorage.setItem('as-tweaks', JSON.stringify(next))
      return next
    })
  }, [])

  return [state, setTweak]
}
