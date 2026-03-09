import React, { useState, useEffect } from 'react'
import { useIpc } from '../../hooks/useIpc'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AccountProfile {
  id: number
  email: string
  displayName: string | null
  tier: 'free' | 'student' | 'scholar' | 'institution'
  licenseKey: string | null
  licenseExpiresAt: string | null
  isLicenseValid: boolean
}

type IpcBridge = ReturnType<typeof useIpc>

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  student: 'Student',
  scholar: 'Scholar',
  institution: 'Institution',
}

const TIER_COLORS: Record<string, string> = {
  free: 'text-[var(--text-secondary)] bg-[var(--bg-secondary)]',
  student: 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30',
  scholar: 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10',
  institution: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30',
}

function formatTierDescription(tier: string): string {
  switch (tier) {
    case 'free':
      return 'Access to core Quran text and basic hadith collections.'
    case 'student':
      return 'All free resources + extended hadith collections and tafsir.'
    case 'scholar':
      return 'Full library access including classical fiqh and advanced linguistics.'
    case 'institution':
      return 'Unlimited multi-user access with administrative tools.'
    default:
      return ''
  }
}

// ─── Sign In / Sign Up Form ───────────────────────────────────────────────────

function AuthForm({
  ipc,
  onAuthenticated,
}: {
  ipc: IpcBridge
  onAuthenticated: (profile: AccountProfile, token: string) => void
}): React.ReactElement {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.')
      return
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.')
        return
      }
    }

    if (!ipc) {
      setError('IPC bridge not available.')
      return
    }

    setLoading(true)
    try {
      const channel = mode === 'signin' ? 'account:sign-in' : 'account:sign-up'
      const args: unknown[] =
        mode === 'signup'
          ? [email.trim(), password, displayName.trim() || undefined]
          : [email.trim(), password]

      const result = (await ipc.invoke(channel, ...args)) as {
        token: string
        profile: AccountProfile
      }

      localStorage.setItem('maktabat:account-token', result.token)
      onAuthenticated(result.profile, result.token)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Tab switcher */}
      <div className="flex border-b border-[var(--border-color)] mb-6">
        {(['signin', 'signup'] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m)
              setError(null)
            }}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              mode === m
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {m === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'signup' ? 'Minimum 8 characters' : 'Your password'}
            required
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
          />
        </div>

        {mode === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              required
              autoComplete="new-password"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
            />
          </div>
        )}

        {error && (
          <div className="px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-[var(--accent-primary)] text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>

        <p className="text-xs text-[var(--text-secondary)] text-center">
          Google SSO coming in a future update. Your data stays on your device.
        </p>
      </form>
    </div>
  )
}

// ─── Profile View ─────────────────────────────────────────────────────────────

function ProfileView({
  ipc,
  profile,
  token,
  onSignOut,
}: {
  ipc: IpcBridge
  profile: AccountProfile
  token: string
  onSignOut: () => void
}): React.ReactElement {
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState(profile.displayName ?? '')
  const [saving, setSaving] = useState(false)

  async function saveName(): Promise<void> {
    if (!ipc) return
    setSaving(true)
    try {
      await ipc.invoke('account:update-display-name', token, newName)
      setEditingName(false)
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut(): Promise<void> {
    if (ipc) await ipc.invoke('account:sign-out', token)
    localStorage.removeItem('maktabat:account-token')
    onSignOut()
  }

  const tierBadge = TIER_COLORS[profile.tier] ?? TIER_COLORS.free

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[var(--accent-primary)]/15 flex items-center justify-center text-2xl font-bold text-[var(--accent-primary)]">
          {(profile.displayName ?? profile.email)[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void saveName()
                  if (e.key === 'Escape') setEditingName(false)
                }}
              />
              <button
                onClick={() => void saveName()}
                disabled={saving}
                className="px-3 py-1 text-xs rounded bg-[var(--accent-primary)] text-white"
              >
                Save
              </button>
              <button
                onClick={() => setEditingName(false)}
                className="px-3 py-1 text-xs rounded border border-[var(--border-color)] text-[var(--text-secondary)]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[var(--text-primary)] truncate">
                {profile.displayName ?? 'Unnamed User'}
              </h3>
              <button
                onClick={() => setEditingName(true)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs"
                title="Edit name"
              >
                ✎
              </button>
            </div>
          )}
          <p className="text-sm text-[var(--text-secondary)] truncate">{profile.email}</p>
        </div>
        <button
          onClick={() => void handleSignOut()}
          className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Subscription tier */}
      <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--text-primary)]">Subscription</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tierBadge}`}>
            {TIER_LABELS[profile.tier] ?? profile.tier}
          </span>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          {formatTierDescription(profile.tier)}
        </p>
        {profile.tier === 'free' && (
          <button className="mt-3 w-full py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            Upgrade to Student →
          </button>
        )}
        {profile.licenseExpiresAt && (
          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            {profile.isLicenseValid ? '✅' : '⚠️'} License expires:{' '}
            {new Date(profile.licenseExpiresAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Multi-device note */}
      <div className="p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm text-[var(--text-secondary)]">
        <span className="font-medium text-[var(--text-primary)]">Multi-device licensing: </span>
        Up to 3 devices per account. Device management available in a future update.
      </div>
    </div>
  )
}

// ─── Main AccountPanel Component ─────────────────────────────────────────────

export default function AccountPanel(): React.ReactElement {
  const ipc = useIpc()
  const [profile, setProfile] = useState<AccountProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('maktabat:account-token')
    if (!storedToken || !ipc) {
      setLoading(false)
      return
    }
    ipc
      .invoke('account:get-profile', storedToken)
      .then((p) => {
        if (p) {
          setProfile(p as AccountProfile)
          setToken(storedToken)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [ipc])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (profile && token) {
    return (
      <ProfileView
        ipc={ipc}
        profile={profile}
        token={token}
        onSignOut={() => {
          setProfile(null)
          setToken(null)
        }}
      />
    )
  }

  return (
    <AuthForm
      ipc={ipc}
      onAuthenticated={(p, t) => {
        setProfile(p)
        setToken(t)
      }}
    />
  )
}
