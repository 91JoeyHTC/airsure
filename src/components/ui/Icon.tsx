import React from 'react'

interface IconProps {
  name: string
  size?: number
  stroke?: number
}

const PATHS: Record<string, React.ReactNode> = {
  search:    <><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></>,
  bell:      <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
  home:      <><path d="m3 12 9-9 9 9"/><path d="M5 10v10h14V10"/></>,
  users:     <><circle cx="9" cy="8" r="4"/><path d="M3 21v-2a6 6 0 0 1 12 0v2"/><circle cx="17" cy="8" r="3"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></>,
  headset:   <><path d="M3 14v-2a9 9 0 0 1 18 0v2"/><path d="M21 19a2 2 0 0 1-2 2h-1v-7h3v5ZM3 19a2 2 0 0 0 2 2h1v-7H3v5Z"/></>,
  box:       <><path d="m3 7 9-4 9 4-9 4-9-4Z"/><path d="M3 7v10l9 4 9-4V7"/><path d="m12 11 0 10"/></>,
  star:      <path d="m12 3 2.6 5.5 6 .9-4.3 4.2 1 6-5.3-2.8L6.7 19.6l1-6L3.4 9.4l6-.9L12 3Z"/>,
  chart:     <><path d="M3 21h18"/><path d="M7 17V9M12 17V5M17 17v-6"/></>,
  bullhorn:  <><path d="M3 11v2a3 3 0 0 0 3 3h2l8 4V4l-8 4H6a3 3 0 0 0-3 3Z"/><path d="M17 9a3 3 0 0 1 0 6"/></>,
  sparkles:  <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></>,
  download:  <><path d="M12 3v12M6 11l6 6 6-6M5 21h14"/></>,
  refresh:   <><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/></>,
  plus:      <><path d="M12 5v14M5 12h14"/></>,
  arrow:     <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  phone:     <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/>,
  msg:       <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>,
  eye:       <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z"/><circle cx="12" cy="12" r="3"/></>,
  up:        <><path d="m5 12 7-7 7 7"/><path d="M12 5v14"/></>,
  down:      <><path d="m5 12 7 7 7-7"/><path d="M12 5v14"/></>,
  cal:       <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
  pulse:     <path d="M3 12h4l3-8 4 16 3-8h4"/>,
  filter:    <path d="M3 5h18l-7 9v6l-4-2v-4Z"/>,
  wind:      <><path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 16h15a3 3 0 1 1-3 3"/><path d="M3 12h7"/></>,
  drop:      <path d="M12 3s7 8 7 12a7 7 0 1 1-14 0c0-4 7-12 7-12Z"/>,
  thermo:    <><path d="M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0Z"/></>,
  device:    <><rect x="4" y="5" width="16" height="14" rx="0"/><path d="M9 9h6v6H9Z"/></>,
  globe:     <><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></>,
  chevR:     <path d="m9 6 6 6-6 6"/>,
  chevD:     <path d="m6 9 6 6 6-6"/>,
  sun:       <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
  moon:      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>,
  menu:      <><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></>,
  settings:  <><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41"/></>,
  check:     <path d="m5 12 5 5 9-9"/>,
  x:         <><path d="m18 6-12 12"/><path d="m6 6 12 12"/></>,
  send:      <path d="m22 2-7 20-4-9-9-4 20-7Z"/>,
  brain:     <><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588 4 4 0 1 0 7.967 2v-8.5"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 19.5"/></>,
  award:     <><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></>,
  trending:  <><path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></>,
  package:   <><path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></>,
  zap:       <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/>,
  clipboard: <><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></>,
  activity:  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>,
  users2:    <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  dollar:    <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
  mail:      <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></>,
  share:     <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
  'alert-triangle': <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/></>,
  target:    <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
  layers:    <><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 12.65-8.58 3.91a2 2 0 0 1-1.66 0L3.42 12.65"/><path d="m22 17.65-8.58 3.91a2 2 0 0 1-1.66 0L3.42 17.65"/></>,
}

export function Icon({ name, size = 16, stroke = 1.5 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {PATHS[name] ?? null}
    </svg>
  )
}
