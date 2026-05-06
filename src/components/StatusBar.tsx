import React from 'react'

interface Props {
  message: string
}

const TIPS = [
  '💡 TikTok Live Studio: Add Window Capture → Select "Reactive Avatar - Overlay"',
  '💡 OBS: Add Window Capture → Select "Reactive Avatar - Overlay"',
  '💡 Use Green Screen + Chroma Key filter in OBS for transparent background',
  '💡 Keep sensitivity low for quiet environments, high for noisy ones',
  '💡 Adjust Silence Delay to prevent avatar flickering',
]

export function StatusBar({ message }: Props) {
  const tip = TIPS[Math.floor(Date.now() / 10000) % TIPS.length]

  return (
    <div className="status-bar">
      <div className="status-msg">
        {message || tip}
      </div>
      <div className="status-brand">
        Reactive Avatar Studio v1.0
      </div>
    </div>
  )
}
