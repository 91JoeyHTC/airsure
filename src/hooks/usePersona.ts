import { useState, useCallback } from 'react'

export type PersonaId = 'gm' | 'cs' | 'svc' | 'mk'

export interface Persona {
  id: PersonaId
  label: string
  icon: string
  focus: string
}

export const PERSONAS: Persona[] = [
  { id: 'gm',  label: '總經理', icon: 'chart',   focus: '營收 / 整體' },
  { id: 'cs',  label: '顧問',   icon: 'pulse',   focus: '健康 / 客戶' },
  { id: 'svc', label: '客服',   icon: 'headset', focus: '工單 / 設備' },
  { id: 'mk',  label: '行銷',   icon: 'bullhorn',focus: '會員 / 轉換' },
]

export function usePersona() {
  const [persona, setPersonaState] = useState<PersonaId>(() => {
    return (localStorage.getItem('as-persona') as PersonaId) || 'gm'
  })

  const setPersona = useCallback((id: PersonaId) => {
    localStorage.setItem('as-persona', id)
    setPersonaState(id)
  }, [])

  return { persona, setPersona, personas: PERSONAS }
}
