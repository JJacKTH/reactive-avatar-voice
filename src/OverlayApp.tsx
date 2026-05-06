import React, { useState, useEffect, useRef, useCallback } from 'react'
import './overlay.css'

interface OverlayAPI {
  onAvatarState: (callback: (payload: { avatarState: string; currentImageData: string | null; volume?: number }) => void) => () => void
  onOverlayImages: (callback: (imageData: Record<string, string | null>) => void) => () => void
  onOverlaySettings: (callback: (payload: { backgroundColor: string; greenScreenEnabled: boolean; bounceEnabled: boolean; scaleEnabled: boolean }) => void) => () => void
}

const api = (): OverlayAPI => (window as unknown as { overlayAPI: OverlayAPI }).overlayAPI

function OverlayApp() {
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [avatarState, setAvatarState] = useState<string>('idle')
  const [backgroundColor, setBackgroundColor] = useState('#00FF00')
  const [greenScreenEnabled, setGreenScreenEnabled] = useState(true)
  const [bounceEnabled, setBounceEnabled] = useState(true)
  const [scaleEnabled, setScaleEnabled] = useState(true)
  const [volume, setVolume] = useState(0)
  const [images, setImages] = useState<Record<string, string | null>>({
    idle: null, talk1: null, talk2: null, talk3: null, blink: null, mute: null
  })

  // Listen for avatar state from control panel
  useEffect(() => {
    const cleanup = api().onAvatarState((payload) => {
      setAvatarState(payload.avatarState)
      if (payload.currentImageData) {
        setCurrentImage(payload.currentImageData)
      }
      if (payload.volume !== undefined) {
        setVolume(payload.volume)
      }
    })
    return cleanup
  }, [])

  // Listen for image data updates
  useEffect(() => {
    const cleanup = api().onOverlayImages((imageData) => {
      setImages(imageData)
    })
    return cleanup
  }, [])

  // Listen for settings updates
  useEffect(() => {
    const cleanup = api().onOverlaySettings((payload) => {
      setBackgroundColor(payload.backgroundColor)
      setGreenScreenEnabled(payload.greenScreenEnabled)
      setBounceEnabled(payload.bounceEnabled)
      setScaleEnabled(payload.scaleEnabled)
    })
    return cleanup
  }, [])

  // Update background
  useEffect(() => {
    document.body.style.backgroundColor = greenScreenEnabled ? backgroundColor : 'transparent'
  }, [backgroundColor, greenScreenEnabled])

  const bgColor = greenScreenEnabled ? backgroundColor : 'transparent'

  // Calculate dynamic scale based on volume
  const dynamicScale = scaleEnabled && avatarState === 'talking' 
    ? 1 + (volume / 100) * 0.1 
    : 1

  return (
    <div className="overlay-container" style={{ backgroundColor: bgColor }}>
      {currentImage ? (
        <div className={`avatar-wrapper ${bounceEnabled && avatarState === 'talking' ? 'animate-bounce' : ''}`}>
          <img
            src={currentImage}
            alt="Avatar"
            className={`avatar-image state-${avatarState}`}
            style={{ 
              transform: `scale(${dynamicScale})`,
              transition: 'transform 0.1s ease-out'
            }}
            draggable={false}
          />
        </div>
      ) : (
        <div className="no-image-notice">
          <span className="no-image-icon">🎭</span>
        </div>
      )}
    </div>
  )
}

export default OverlayApp
