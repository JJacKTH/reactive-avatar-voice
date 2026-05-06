import React from 'react'

interface Props {
  isOverlayOpen: boolean
  alwaysOnTop: boolean
  greenScreenEnabled: boolean
  backgroundColor: string
  overlayWidth: number
  overlayHeight: number
  bounceEnabled: boolean
  scaleEnabled: boolean
  blinkRate: number
  onOpenOverlay: () => void
  onCloseOverlay: () => void
  onAlwaysOnTopChange: (value: boolean) => void
  onGreenScreenChange: (value: boolean) => void
  onBackgroundColorChange: (value: string) => void
  onBounceChange: (value: boolean) => void
  onScaleChange: (value: boolean) => void
  onBlinkRateChange: (value: number) => void
  onWidthChange: (value: number) => void
  onHeightChange: (value: number) => void
  onResetSize: () => void
  onResizeOverlay: () => void
}

export function OverlayControls({
  isOverlayOpen,
  alwaysOnTop,
  greenScreenEnabled,
  backgroundColor,
  overlayWidth,
  overlayHeight,
  bounceEnabled,
  scaleEnabled,
  blinkRate,
  onOpenOverlay,
  onCloseOverlay,
  onAlwaysOnTopChange,
  onGreenScreenChange,
  onBackgroundColorChange,
  onBounceChange,
  onScaleChange,
  onBlinkRateChange,
  onWidthChange,
  onHeightChange,
  onResetSize,
  onResizeOverlay
}: Props) {
  return (
    <div className="panel overlay-controls">
      <h2 className="panel-title">
        <span className="panel-icon">🖥️</span>
        Overlay Controls
      </h2>

      {/* Open / Close */}
      <div className="setting-group">
        <div className="btn-row">
          <button
            id="open-overlay-btn"
            className={`btn btn-primary ${isOverlayOpen ? 'btn-disabled' : ''}`}
            onClick={onOpenOverlay}
            disabled={isOverlayOpen}
          >
            🟢 Open Overlay
          </button>
          <button
            id="close-overlay-btn"
            className={`btn btn-danger ${!isOverlayOpen ? 'btn-disabled' : ''}`}
            onClick={onCloseOverlay}
            disabled={!isOverlayOpen}
          >
            🔴 Close Overlay
          </button>
        </div>
        <div className={`overlay-status-badge ${isOverlayOpen ? 'open' : 'closed'}`}>
          {isOverlayOpen ? '● Overlay Active' : '○ Overlay Closed'}
        </div>
      </div>

      {/* Toggles Group */}
      <div className="setting-group">
        <div className="divider" style={{ margin: '0 0 12px 0' }} />
        
        <label className="toggle-row mb-sm">
          <span className="setting-label">Always On Top</span>
          <div
            className={`toggle ${alwaysOnTop ? 'active' : ''}`}
            onClick={() => onAlwaysOnTopChange(!alwaysOnTop)}
            id="always-on-top-toggle"
          >
            <div className="toggle-knob" />
          </div>
        </label>

        <label className="toggle-row mb-sm">
          <span className="setting-label">Green Screen</span>
          <div
            className={`toggle ${greenScreenEnabled ? 'active' : ''}`}
            onClick={() => onGreenScreenChange(!greenScreenEnabled)}
            id="green-screen-toggle"
          >
            <div className="toggle-knob" />
          </div>
        </label>

        <label className="toggle-row mb-sm">
          <span className="setting-label">Bounce Effect</span>
          <div
            className={`toggle ${bounceEnabled ? 'active' : ''}`}
            onClick={() => onBounceChange(!bounceEnabled)}
            id="bounce-toggle"
          >
            <div className="toggle-knob" />
          </div>
        </label>

        <label className="toggle-row">
          <span className="setting-label">Volume Scaling</span>
          <div
            className={`toggle ${scaleEnabled ? 'active' : ''}`}
            onClick={() => onScaleChange(!scaleEnabled)}
            id="scale-toggle"
          >
            <div className="toggle-knob" />
          </div>
        </label>
      </div>

      {/* Blink Rate */}
      <div className="setting-group">
        <label className="setting-label">
          Blink Frequency
          <span className="setting-value">{blinkRate}%</span>
        </label>
        <input
          id="blink-rate-slider"
          type="range"
          min="0"
          max="100"
          step="5"
          value={blinkRate}
          onChange={e => onBlinkRateChange(Number(e.target.value))}
          className="slider"
        />
      </div>

      {/* Background Color */}
      <div className="setting-group">
        <label className="setting-label">Background Color</label>
        <div className="color-picker-row">
          <input
            id="bg-color-picker"
            type="color"
            value={backgroundColor}
            onChange={e => onBackgroundColorChange(e.target.value)}
            className="color-picker"
          />
          <input
            type="text"
            value={backgroundColor}
            onChange={e => onBackgroundColorChange(e.target.value)}
            className="text-input color-text"
            maxLength={7}
          />
        </div>
      </div>

      {/* Dimensions */}
      <div className="setting-group">
        <label className="setting-label">Overlay Size</label>
        <div className="size-inputs">
          <div className="size-field">
            <label className="size-label">W</label>
            <input
              id="overlay-width"
              type="number"
              value={overlayWidth}
              onChange={e => onWidthChange(Number(e.target.value))}
              className="text-input size-input"
              min={128}
              max={3840}
            />
          </div>
          <span className="size-x">×</span>
          <div className="size-field">
            <label className="size-label">H</label>
            <input
              id="overlay-height"
              type="number"
              value={overlayHeight}
              onChange={e => onHeightChange(Number(e.target.value))}
              className="text-input size-input"
              min={128}
              max={2160}
            />
          </div>
        </div>
        <div className="btn-row mt-sm">
          <button className="btn btn-secondary" onClick={onResizeOverlay}>
            📐 Apply Size
          </button>
          <button className="btn btn-ghost" onClick={onResetSize}>
            ↺ Reset
          </button>
        </div>
      </div>
    </div>
  )
}
