'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Check, Copy, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/primitives/label'
import { Switch } from '@/components/primitives/switch'
import { useConsoleRole } from '@/components/shared/ConsoleRoleContext'
import { useToast } from '@/components/shared/Toast'
import { useLocalStorageJson } from '@/components/shared/useLocalStorageJson'
import {
  createMockApiKey,
  mockApiKey,
  mockConsoleEmail,
  mockConsoleUser,
  mockNotificationPreferences,
  mockSettingsStorageKeys,
} from '@/data/console'

type SettingsProfile = { name: string; email: string }
type NotificationPreferences = typeof mockNotificationPreferences
const DEFAULT_PROFILE: SettingsProfile = { name: mockConsoleUser.name, email: mockConsoleEmail }

function isProfile(value: unknown): value is SettingsProfile {
  return value !== null
    && typeof value === 'object'
    && 'name' in value
    && typeof value.name === 'string'
    && 'email' in value
    && typeof value.email === 'string'
}

function isNotificationPreferences(value: unknown): value is NotificationPreferences {
  return value !== null
    && typeof value === 'object'
    && 'security' in value
    && typeof value.security === 'boolean'
    && 'product' in value
    && typeof value.product === 'boolean'
    && 'account' in value
    && typeof value.account === 'boolean'
}

function isMockKey(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('rva_demo_')
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function SettingsPage() {
  const role = useConsoleRole()
  const toast = useToast()
  const profileState = useLocalStorageJson(mockSettingsStorageKeys.profile, DEFAULT_PROFILE, isProfile)
  const notificationsState = useLocalStorageJson(mockSettingsStorageKeys.notifications, mockNotificationPreferences, isNotificationPreferences)
  const apiKeyState = useLocalStorageJson(mockSettingsStorageKeys.apiKey, mockApiKey, isMockKey)
  const [profileDraft, setProfileDraft] = useState<SettingsProfile | null>(null)
  const [profileTouched, setProfileTouched] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [notificationsDraft, setNotificationsDraft] = useState<NotificationPreferences | null>(null)
  const profile = profileDraft ?? profileState.value
  const notifications = notificationsDraft ?? notificationsState.value
  const apiKey = apiKeyState.value
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordTouched, setPasswordTouched] = useState({ current: false, next: false, confirm: false })

  const profileError = profileTouched && !profile.name.trim() ? 'Enter your name.' : ''
  const emailError = emailTouched && !validEmail(profile.email) ? 'Enter a valid email address.' : ''
  const currentPasswordError = passwordTouched.current && !currentPassword ? 'Enter the current password.' : ''
  const newPasswordError = passwordTouched.next && newPassword.length < 8 ? 'Use at least 8 characters.' : ''
  const confirmPasswordError = passwordTouched.confirm && confirmPassword !== newPassword ? 'Passwords do not match.' : ''

  useEffect(() => {
    const storedValues = [
      ['profile', profileState.error],
      ['notification preferences', notificationsState.error],
      ['mock API key', apiKeyState.error],
    ] as const
    storedValues.forEach(([label, error]) => {
      if (error) {
        console.error(`Unable to restore ${label}`, error)
        toast({ title: `${label} could not be restored`, description: error.message, variant: 'error' })
      }
    })
  }, [apiKeyState.error, notificationsState.error, profileState.error, toast])

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProfileTouched(true)
    setEmailTouched(true)
    if (!profile.name.trim() || !validEmail(profile.email)) return
    try {
      const savedProfile = {
        name: profile.name.trim(),
        email: profile.email.trim(),
      }
      profileState.setValue(savedProfile)
      setProfileDraft(null)
      toast({ title: 'Profile saved', description: 'This mock profile is stored in this browser only.', variant: 'success' })
    } catch (error) {
      console.error('Unable to save profile settings', error)
      toast({ title: 'Profile could not be saved', description: 'Browser storage is unavailable or full.', variant: 'error' })
    }
  }

  function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordTouched({ current: true, next: true, confirm: true })
    if (!currentPassword || newPassword.length < 8 || newPassword !== confirmPassword) return
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordTouched({ current: false, next: false, confirm: false })
    toast({ title: 'Mock password updated', description: 'No password was sent to or stored by a backend.', variant: 'success' })
  }

  function saveNotifications() {
    try {
      notificationsState.setValue(notifications)
      setNotificationsDraft(null)
      toast({ title: 'Notification preferences saved', description: 'Preferences are stored in this browser only.', variant: 'success' })
    } catch (error) {
      console.error('Unable to save notification preferences', error)
      toast({ title: 'Preferences could not be saved', description: 'Browser storage is unavailable or full.', variant: 'error' })
    }
  }

  async function copyApiKey() {
    try {
      await navigator.clipboard.writeText(apiKey)
      toast({ title: 'Mock key copied', description: 'This demo key is not a real credential.', variant: 'success' })
    } catch (error) {
      console.error('Unable to copy the mock API key', error)
      toast({ title: 'Key could not be copied', description: 'Clipboard access is unavailable in this browser.', variant: 'error' })
    }
  }

  function regenerateApiKey() {
    const nextKey = createMockApiKey()
    try {
      apiKeyState.setValue(nextKey)
      toast({ title: 'Demo key regenerated', description: 'The new mock value is local-only and cannot authenticate requests.', variant: 'success' })
    } catch (error) {
      console.error('Unable to regenerate the mock API key', error)
      toast({ title: 'Key could not be regenerated', description: 'Browser storage is unavailable or full.', variant: 'error' })
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        breadcrumbs={[{ label: role[0].toUpperCase() + role.slice(1) }, { label: 'Settings' }]}
        title={role === 'admin' ? 'Account settings' : 'Settings'}
        description="Manage prototype account preferences. All values are mock and browser-local."
        action={role === 'admin'
          ? <Link href="/admin/settings" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Platform settings</Link>
          : <a href="#profile-settings" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Edit profile</a>}
      />

      {role === 'admin' ? (
        <div className="space-y-4">
          <EmptyState title="Platform settings" description="Admin platform configuration is available in the dedicated settings workspace." />
          <Link href="/admin/settings" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Open platform settings</Link>
        </div>
      ) : (
        <>
          <Card id="profile-settings" className="p-5 sm:p-6">
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={saveProfile} noValidate>
              <div className="sm:col-span-2">
                <h2 className="text-lg font-semibold text-navy-900">Profile</h2>
                <p className="mt-1 text-sm text-slate-600">Update the demo name and email shown in this prototype.</p>
              </div>
              <Input
                id="settings-name"
                label="Name"
                autoComplete="name"
                value={profile.name}
                onChange={(event) => setProfileDraft((current) => ({ ...(current ?? profile), name: event.target.value }))}
                onBlur={() => setProfileTouched(true)}
                error={profileError}
              />
              <Input
                id="settings-email"
                label="Email"
                type="email"
                autoComplete="email"
                value={profile.email}
                onChange={(event) => setProfileDraft((current) => ({ ...(current ?? profile), email: event.target.value }))}
                onBlur={() => setEmailTouched(true)}
                error={emailError}
              />
              <div className="sm:col-span-2">
                <Button type="submit">Save profile</Button>
              </div>
            </form>
          </Card>

          <Card className="p-5 sm:p-6">
            <form className="grid gap-4 sm:grid-cols-3" onSubmit={savePassword} noValidate>
              <div className="sm:col-span-3">
                <h2 className="text-lg font-semibold text-navy-900">Password</h2>
                <p className="mt-1 text-sm text-slate-600">This form demonstrates validation only; credentials are never stored.</p>
              </div>
              <Input
                id="settings-current-password"
                label="Current password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                onBlur={() => setPasswordTouched((current) => ({ ...current, current: true }))}
                error={currentPasswordError}
              />
              <Input
                id="settings-new-password"
                label="New password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                onBlur={() => setPasswordTouched((current) => ({ ...current, next: true }))}
                error={newPasswordError}
              />
              <Input
                id="settings-confirm-password"
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                onBlur={() => setPasswordTouched((current) => ({ ...current, confirm: true }))}
                error={confirmPasswordError}
              />
              <div className="sm:col-span-3">
                <Button type="submit">Update mock password</Button>
              </div>
            </form>
          </Card>

          <Card className="space-y-5 p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-semibold text-navy-900">Notifications</h2>
              <p className="mt-1 text-sm text-slate-600">Choose which mock account notifications you want to see.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {([
                ['security', 'Security notices'],
                ['product', 'Product updates'],
                ['account', 'Account activity'],
              ] as const).map(([key, label]) => (
                <div key={key} className="flex items-center gap-3">
                  <Switch
                    id={`notification-${key}`}
                    checked={notifications[key]}
                    onCheckedChange={(checked) => setNotificationsDraft((current) => ({ ...(current ?? notifications), [key]: checked }))}
                  />
                  <Label htmlFor={`notification-${key}`}>{label}</Label>
                </div>
              ))}
            </div>
            <Button type="button" onClick={saveNotifications}>Save notification preferences</Button>
          </Card>

          <Card className="space-y-4 p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-semibold text-navy-900">API key</h2>
              <p className="mt-1 text-sm text-slate-600">The displayed key is a fake demo string. It cannot authorize API requests.</p>
            </div>
            <Label htmlFor="settings-api-key" className="sr-only">Fake demo API key</Label>
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
              <input
                id="settings-api-key"
                readOnly
                value={apiKey}
                className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 font-mono text-sm text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              />
              <Button type="button" variant="outline" onClick={copyApiKey} className="shrink-0"><Copy className="h-4 w-4" aria-hidden="true" />Copy</Button>
              <Button type="button" variant="outline" onClick={regenerateApiKey} className="shrink-0"><RefreshCw className="h-4 w-4" aria-hidden="true" />Regenerate demo key</Button>
            </div>
            <p className="flex items-start gap-2 text-xs text-slate-500"><Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />Never paste a real secret into this prototype.</p>
          </Card>
        </>
      )}
    </div>
  )
}
