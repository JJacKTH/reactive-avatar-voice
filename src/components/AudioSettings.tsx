import React from 'react'

interface Props {
  devices: MediaDeviceInfo[]
  selectedDeviceId: string
  isListening: boolean
  volume: number
  sensitivity: number
  silenceDelay: number
  frameSpeed: number
  error: string | null
  onSelectDevice: (deviceId: string) => void
  onStartListening: () => void
  onStopListening: () => void
  onSensitivityChange: (value: number) => void
  onSilenceDelayChange: (value: number) => void
  onFrameSpeedChange: (value: number) => void
  onRefreshDevices: () => void
}

export function AudioSettings({
  devices,
  selectedDeviceId,
  isListening,
  volume,
  sensitivity,
  silenceDelay,
  frameSpeed,
  error,
  onSelectDevice,
  onStartListening,
  onStopListening,
  onSensitivityChange,
  onSilenceDelayChange,
  onFrameSpeedChange,
  onRefreshDevices
}: Props) {
  // Volume meter bar color based on level
  const getMeterColor = () => {
    if (volume >= sensitivity) return '#22c55e'
    if (volume >= sensitivity * 0.6) return '#eab308'
    return '#6366f1'
  }

  return (
    <div className="panel audio-settings">
      <h2 className="panel-title">
        <span className="panel-icon">🎙️</span>
        Audio Settings
      </h2>

      {/* Microphone selection */}
      <div className="setting-group">
        <label className="setting-label">Microphone</label>
        <div className="mic-select-row">
          <select
            id="mic-select"
            className="select-input"
            value={selectedDeviceId}
            onChange={e => onSelectDevice(e.target.value)}
          >
            <option value="">Default Microphone</option>
            {devices.map(d => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Microphone ${d.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
          <button
            className="btn btn-icon"
            onClick={onRefreshDevices}
            title="Refresh devices"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Start/Stop */}
      <div className="setting-group">
        <button
          id="mic-toggle"
          className={`btn btn-full ${isListening ? 'btn-danger' : 'btn-primary'}`}
          onClick={isListening ? onStopListening : onStartListening}
        >
          {isListening ? '⏹ Stop Listening' : '▶ Start Listening'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="error-msg">⚠️ {error}</div>
      )}

      {/* Volume Meter */}
      <div className="setting-group">
        <label className="setting-label">
          Volume Level
          <span className="setting-value">{volume}</span>
        </label>
        <div className="volume-meter">
          <div
            className="volume-bar"
            style={{
              width: `${volume}%`,
              backgroundColor: getMeterColor()
            }}
          />
          <div
            className="sensitivity-line"
            style={{ left: `${sensitivity}%` }}
            title={`Sensitivity threshold: ${sensitivity}`}
          />
        </div>
      </div>

      {/* Sensitivity */}
      <div className="setting-group">
        <label className="setting-label">
          Sensitivity
          <span className="setting-value">{sensitivity}</span>
        </label>
        <input
          id="sensitivity-slider"
          type="range"
          min="1"
          max="100"
          value={sensitivity}
          onChange={e => onSensitivityChange(Number(e.target.value))}
          className="slider"
        />
      </div>

      {/* Silence Delay */}
      <div className="setting-group">
        <label className="setting-label">
          Silence Delay
          <span className="setting-value">{silenceDelay}ms</span>
        </label>
        <input
          id="silence-delay-slider"
          type="range"
          min="50"
          max="2000"
          step="50"
          value={silenceDelay}
          onChange={e => onSilenceDelayChange(Number(e.target.value))}
          className="slider"
        />
      </div>

      {/* Frame Speed */}
      <div className="setting-group">
        <label className="setting-label">
          Frame Speed
          <span className="setting-value">{frameSpeed}ms</span>
        </label>
        <input
          id="frame-speed-slider"
          type="range"
          min="50"
          max="1000"
          step="25"
          value={frameSpeed}
          onChange={e => onFrameSpeedChange(Number(e.target.value))}
          className="slider"
        />
      </div>
    </div>
  )
}
