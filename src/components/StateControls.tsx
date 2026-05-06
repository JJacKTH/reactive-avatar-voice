import React from 'react'
import type { AvatarState } from '../types'

interface Props {
  isMuted: boolean
  avatarState: AvatarState
  onMuteToggle: () => void
  onForceIdle: () => void
  onForceTalk: () => void
  onSave: () => void
  onReset: () => void
}

export function StateControls({
  isMuted,
  avatarState,
  onMuteToggle,
  onForceIdle,
  onForceTalk,
  onSave,
  onReset
}: Props) {
  const stateIcon = avatarState === 'muted' ? '🔇' : avatarState === 'talking' ? '🗣️' : '😴'
  const stateLabel = avatarState === 'muted' ? 'Muted' : avatarState === 'talking' ? 'Talking' : 'Idle'

  return (
    <div className="panel state-controls">
      <h2 className="panel-title">
        <span className="panel-icon">🎮</span>
        State Controls
      </h2>

      {/* Current state indicator */}
      <div className="setting-group">
        <div className={`state-indicator state-${avatarState}`}>
          <span className="state-icon">{stateIcon}</span>
          <span className="state-label">{stateLabel}</span>
        </div>
      </div>

      {/* Mute toggle */}
      <div className="setting-group">
        <button
          id="mute-btn"
          className={`btn btn-full ${isMuted ? 'btn-warning' : 'btn-secondary'}`}
          onClick={onMuteToggle}
        >
          {isMuted ? '🔇 Unmute' : '🔈 Mute'}
        </button>
      </div>

      {/* Force state buttons */}
      <div className="setting-group">
        <div className="btn-row">
          <button
            id="force-idle-btn"
            className="btn btn-ghost"
            onClick={onForceIdle}
          >
            😴 Force Idle
          </button>
          <button
            id="force-talk-btn"
            className="btn btn-ghost"
            onClick={onForceTalk}
          >
            🗣️ Force Talk
          </button>
        </div>
      </div>

      <div className="divider" />

      {/* Save / Reset */}
      <div className="setting-group">
        <button
          id="save-settings-btn"
          className="btn btn-primary btn-full"
          onClick={onSave}
        >
          💾 Save Settings
        </button>
      </div>
      <div className="setting-group">
        <button
          id="reset-settings-btn"
          className="btn btn-ghost btn-full"
          onClick={onReset}
        >
          ↺ Reset Settings
        </button>
      </div>
    </div>
  )
}
