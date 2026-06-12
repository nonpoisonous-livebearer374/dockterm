import type { ReactNode } from 'react'
import { useAppStore } from '../../state/useAppStore'
import type { AccentName, CursorStyle, TerminalRenderer, Settings } from '@shared/types'

const ACCENTS: { id: AccentName; label: string; color: string }[] = [
  { id: 'violet', label: 'Violet', color: '#7c6bff' },
  { id: 'blue', label: 'Blue', color: '#5b8aff' },
  { id: 'teal', label: 'Teal', color: '#2dd4bf' }
]

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="settings-section">
      <div className="settings-section__title">{title}</div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="settings-field">
      <span className="settings-field__label">{label}</span>
      <div className="settings-field__control">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      className={`toggle${checked ? ' toggle--on' : ''}`}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle__knob" />
    </button>
  )
}

function clampNum(value: string, lo: number, hi: number, fallback: number): number {
  const n = Number.parseInt(value, 10)
  if (Number.isNaN(n)) return fallback
  return Math.min(hi, Math.max(lo, n))
}

export function SettingsPanel() {
  const settings = useAppStore((s) => s.settings)
  const update = useAppStore((s) => s.updatePreferences)
  if (!settings) return null
  const s = settings

  const setTerminal = (patch: Partial<Settings['terminal']>) =>
    void update({ terminal: { ...s.terminal, ...patch } })
  const setEditor = (patch: Partial<Settings['editor']>) =>
    void update({ editor: { ...s.editor, ...patch } })
  const setGit = (patch: Partial<Settings['git']>) => void update({ git: { ...s.git, ...patch } })
  const setUi = (patch: Partial<Settings['ui']>) => void update({ ui: { ...s.ui, ...patch } })

  const resetDefaults = () =>
    void update({
      terminal: {
        fontFamily: null,
        fontSize: 13,
        cursorStyle: 'block',
        cursorBlink: true,
        renderer: 'auto',
        scrollback: 5000
      },
      editor: { fontSize: 13 },
      ui: { ...s.ui, accent: 'violet' },
      git: { beginnerMode: true, confirmDanger: true },
      claude: { readUserConfig: false }
    })

  return (
    <div className="panel">
      <div className="panel__head">
        <span className="panel__title">Settings</span>
      </div>
      <div className="panel__body settings">
        <Section title="Appearance">
          <Field label="Accent">
            <div className="settings-accents">
              {ACCENTS.map((a) => (
                <button
                  key={a.id}
                  className={`settings-accent${s.ui.accent === a.id ? ' is-active' : ''}`}
                  style={{ background: a.color, color: a.color }}
                  title={a.label}
                  aria-label={a.label}
                  onClick={() => setUi({ accent: a.id })}
                />
              ))}
            </div>
          </Field>
        </Section>

        <Section title="Terminal">
          <Field label="Font family">
            <input
              className="settings-input"
              value={s.terminal.fontFamily ?? ''}
              placeholder="Default mono"
              spellCheck={false}
              onChange={(e) => setTerminal({ fontFamily: e.target.value.trim() || null })}
            />
          </Field>
          <Field label="Font size">
            <input
              className="settings-num"
              type="number"
              min={8}
              max={32}
              value={s.terminal.fontSize}
              onChange={(e) => setTerminal({ fontSize: clampNum(e.target.value, 8, 32, 13) })}
            />
          </Field>
          <Field label="Cursor">
            <select
              className="settings-select"
              value={s.terminal.cursorStyle}
              onChange={(e) => setTerminal({ cursorStyle: e.target.value as CursorStyle })}
            >
              <option value="block">Block</option>
              <option value="bar">Bar</option>
              <option value="underline">Underline</option>
            </select>
          </Field>
          <Field label="Cursor blink">
            <Toggle checked={s.terminal.cursorBlink} onChange={(v) => setTerminal({ cursorBlink: v })} />
          </Field>
          <Field label="Renderer">
            <select
              className="settings-select"
              value={s.terminal.renderer}
              onChange={(e) => setTerminal({ renderer: e.target.value as TerminalRenderer })}
            >
              <option value="auto">Auto (WebGL)</option>
              <option value="dom">DOM (compatible)</option>
            </select>
          </Field>
        </Section>

        <Section title="Editor">
          <Field label="Font size">
            <input
              className="settings-num"
              type="number"
              min={8}
              max={32}
              value={s.editor.fontSize}
              onChange={(e) => setEditor({ fontSize: clampNum(e.target.value, 8, 32, 13) })}
            />
          </Field>
        </Section>

        <Section title="Git">
          <Field label="Beginner mode">
            <Toggle checked={s.git.beginnerMode} onChange={(v) => setGit({ beginnerMode: v })} />
          </Field>
          <Field label="Confirm destructive actions">
            <Toggle checked={s.git.confirmDanger} onChange={(v) => setGit({ confirmDanger: v })} />
          </Field>
        </Section>

        <Section title="Claude config">
          <Field label="Read my user config">
            <Toggle
              checked={s.claude.readUserConfig}
              onChange={(v) => void update({ claude: { ...s.claude, readUserConfig: v } })}
            />
          </Field>
          <div className="settings-note">
            Off by default. ~/.claude can contain tokens — DockTerm masks them and only reads when
            this is on.
          </div>
        </Section>

        <Section title="Reset">
          <button className="btn btn--ghost btn--sm" onClick={resetDefaults}>
            Reset preferences to defaults
          </button>
        </Section>
      </div>
    </div>
  )
}
