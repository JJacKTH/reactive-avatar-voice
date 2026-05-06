import React from 'react'
import type { AvatarImageData, ImageSlot } from '../types'

interface Props {
  imageData: AvatarImageData
  onSelectImage: (slot: ImageSlot) => void
}

const IMAGE_SLOTS: { key: ImageSlot; label: string; icon: string }[] = [
  { key: 'idle', label: 'Idle Image', icon: '😴' },
  { key: 'talk1', label: 'Talk Image 1', icon: '🗣️' },
  { key: 'talk2', label: 'Talk Image 2', icon: '🗣️' },
  { key: 'talk3', label: 'Talk Image 3', icon: '🗣️' },
  { key: 'blink', label: 'Blink Image', icon: '😉' },
  { key: 'mute', label: 'Mute Image', icon: '🔇' },
]

export function ImageSettings({ imageData, onSelectImage }: Props) {
  return (
    <div className="panel image-settings">
      <h2 className="panel-title">
        <span className="panel-icon">🖼️</span>
        Avatar Images
      </h2>
      <div className="image-grid">
        {IMAGE_SLOTS.map(({ key, label, icon }) => (
          <div key={key} className="image-slot">
            <div className="image-slot-label">
              <span>{icon}</span>
              <span>{label}</span>
            </div>
            <div
              className="image-preview"
              onClick={() => onSelectImage(key)}
              title={`Click to select ${label}`}
            >
              {imageData[key] ? (
                <img
                  src={imageData[key]!}
                  alt={label}
                  className="preview-img"
                />
              ) : (
                <div className="preview-placeholder">
                  <span className="plus-icon">+</span>
                  <span className="placeholder-text">Select</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
