import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { usePersona } from './hooks/usePersona'
import { TweaksPanel } from './components/tweaks/TweaksPanel'
import type { PersonaId } from './hooks/usePersona'

const Dashboard = lazy(() => import('./modules/dashboard/Dashboard').then(m => ({ default: m.Dashboard })))
const ModuleA   = lazy(() => import('./modules/module-a/ModuleA').then(m => ({ default: m.ModuleA })))
const ModuleB   = lazy(() => import('./modules/module-b/ModuleB').then(m => ({ default: m.ModuleB })))
const ModuleC   = lazy(() => import('./modules/module-c/ModuleC').then(m => ({ default: m.ModuleC })))
const ModuleD   = lazy(() => import('./modules/module-d/ModuleD').then(m => ({ default: m.ModuleD })))
const ModuleE   = lazy(() => import('./modules/module-e/ModuleE').then(m => ({ default: m.ModuleE })))
const ModuleF   = lazy(() => import('./modules/module-f/ModuleF').then(m => ({ default: m.ModuleF })))
const ModuleG   = lazy(() => import('./modules/module-g/ModuleG').then(m => ({ default: m.ModuleG })))
const ModuleH   = lazy(() => import('./modules/module-h/ModuleH').then(m => ({ default: m.ModuleH })))

function Loading() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--as-bg)',
      gap: 12,
      color: 'var(--as-mute)',
      fontSize: 14,
    }}>
      <div style={{
        width: 28, height: 28,
        background: 'linear-gradient(135deg, var(--as-primary), #16A085)',
        borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 12, fontWeight: 700,
      }}>A</div>
      AirSure 載入中…
    </div>
  )
}

export default function App() {
  const { persona, setPersona } = usePersona()

  return (
    <>
      <TweaksPanel />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/"          element={<Dashboard persona={persona as PersonaId} onPersona={setPersona} />} />
          <Route path="/module-a"  element={<ModuleA />} />
          <Route path="/module-b"  element={<ModuleB />} />
          <Route path="/module-c"  element={<ModuleC />} />
          <Route path="/module-d"  element={<ModuleD />} />
          <Route path="/module-e"  element={<ModuleE />} />
          <Route path="/module-f"  element={<ModuleF />} />
          <Route path="/module-g"  element={<ModuleG />} />
          <Route path="/module-h"  element={<ModuleH />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}
