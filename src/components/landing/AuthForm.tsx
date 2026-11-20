'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password'
type AccountRole = 'advertiser' | 'publisher'
type LoginRole = AccountRole | 'admin'
type FieldName = 'name' | 'email' | 'password' | 'confirmPassword' | 'role'
type FormErrors = Partial<Record<FieldName, string>>

const signupRoles: { id: AccountRole; title: string; description: string }[] = [
  { id: 'advertiser', title: 'Advertiser', description: 'Plan campaigns and review performance.' },
  { id: 'publisher', title: 'Publisher', description: 'Manage websites, placements, and earnings.' },
]

const loginRoles: { id: LoginRole; title: string; description: string }[] = [
  ...signupRoles,
  { id: 'admin', title: 'Admin', description: 'Review platform activity and operations.' },
]

function getPasswordStrength(password: string) {
  return [
    password.length >= 8,
    /[A-Z]/.test(password) && /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<LoginRole | ''>('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(false)
  const isSignup = mode === 'signup'
  const isLogin = mode === 'login'
  const isForgot = mode === 'forgot-password'
  const isReset = mode === 'reset-password'
  const showPasswordField = isLogin || isSignup || isReset

  const errors: FormErrors = {
    name: isSignup && !name.trim() ? 'Enter your name.' : undefined,
    email: !isReset && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? 'Enter a valid email address.' : undefined,
    password: showPasswordField && password.length < 8 ? 'Use at least 8 characters.' : undefined,
    confirmPassword: isReset && confirmPassword !== password ? 'Passwords do not match.' : undefined,
    role: (isSignup || isLogin) && !role
      ? isSignup ? 'Choose an account type.' : 'Choose a workspace.'
      : undefined,
  }

  function markTouched(field: FieldName) {
    setTouched((current) => ({ ...current, [field]: true }))
  }

  function fieldError(field: FieldName) {
    return (touched[field] || submitted) ? errors[field] : undefined
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    setTouched({ name: true, email: true, password: true, confirmPassword: true, role: true })
    if (Object.values(errors).some(Boolean)) return

    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      if (isForgot || isReset) {
        setComplete(true)
        return
      }
      if (!role) return
      router.push(role === 'admin' ? '/admin' : role === 'publisher' ? '/publisher' : '/dashboard')
    }, 450)
  }

  const heading = isSignup
    ? 'Create your account'
    : isLogin
      ? 'Welcome back'
      : isForgot
        ? 'Reset your password'
        : 'Choose a new password'

  if (complete) {
    return (
      <Card className="!rounded-[20px] !border-0 !shadow-[0_1px_3px_rgba(0,0,0,0.10)] p-8">
        <p className="text-sm font-semibold text-foreground">{isForgot ? 'Recovery request complete' : 'Password reset preview'}</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">{isForgot ? 'Check your inbox' : 'You’re all set'}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {isForgot
            ? 'In a full product, recovery instructions would be sent to this address. No email is sent in this preview.'
            : 'This confirmation is simulated. No account password was changed on a server.'}
        </p>
        <Link href="/login" className="mt-6 inline-flex font-semibold text-foreground hover:underline">Return to sign in</Link>
        {isForgot && <p className="mt-4 text-sm text-muted-foreground">Continue with the <Link href="/reset-password" className="font-semibold text-foreground hover:underline">password reset preview</Link>.</p>}
      </Card>
    )
  }

  return (
    <Card className="!rounded-[20px] !border-0 !shadow-[0_1px_3px_rgba(0,0,0,0.10)] p-8">
      <p className="text-sm font-semibold text-foreground">RivinityADS</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{heading}</h1>
      {!isLogin && <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {isSignup
          ? 'Choose a workspace to explore. No account is created.'
          : isForgot
            ? 'Enter your email to preview the recovery flow.'
            : 'Set a password to preview the reset flow.'}
      </p>}

      <form className="mt-6 space-y-5 [&_input]:!rounded-[12px]" onSubmit={handleSubmit} noValidate>
        {isSignup && (
          <Input
            id="auth-name"
            label="Name"
            name="name"
            autoComplete="name"
            value={name}
            onBlur={() => markTouched('name')}
            onChange={(event) => setName(event.target.value)}
            error={fieldError('name')}
          />
        )}

        {!isReset && <Input
          id="auth-email"
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onBlur={() => markTouched('email')}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldError('email')}
        />}

        {showPasswordField && (
          <div>
            <div className="relative">
              <Input
                id="auth-password"
                label={isReset ? 'New password' : 'Password'}
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isSignup || isReset ? 'new-password' : 'current-password'}
                value={password}
                onBlur={() => markTouched('password')}
                onChange={(event) => setPassword(event.target.value)}
                error={fieldError('password')}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-8 rounded-lg p-2 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>

            {(isSignup || isReset) && (
              <div className="mt-3" aria-live="polite">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Password strength</span>
                  <span className="text-muted-foreground">{['Add a password', 'Weak', 'Fair', 'Good', 'Strong'][getPasswordStrength(password)]}</span>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-1" aria-hidden="true">
                  {[0, 1, 2, 3].map((level) => (
                    <span key={level} className={`h-1.5 rounded-full ${getPasswordStrength(password) > level ? 'bg-primary' : 'bg-border'}`} />
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Use 8+ characters with a mix of letters, numbers, and symbols.</p>
              </div>
            )}
          </div>
        )}

        {isReset && (
          <div className="relative">
            <Input
              id="auth-confirm-password"
              label="Confirm new password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onBlur={() => markTouched('confirmPassword')}
              onChange={(event) => setConfirmPassword(event.target.value)}
              error={fieldError('confirmPassword')}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
              className="absolute right-2 top-8 rounded-lg p-2 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        )}

        {(isSignup || isLogin) && (
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground">{isSignup ? 'Choose your workspace' : 'Continue as'}</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(isLogin ? loginRoles : signupRoles).map((option) => (
                <label key={option.id} className="cursor-pointer">
                  <input
                    className="peer sr-only"
                    type="radio"
                    name="role"
                    value={option.id}
                    checked={role === option.id}
                    onBlur={() => markTouched('role')}
                    onChange={() => setRole(option.id)}
                    aria-describedby={fieldError('role') ? 'auth-role-error' : undefined}
                  />
                  <span className={`block h-full rounded-md border p-3 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring ${role === option.id ? 'border-primary bg-secondary' : 'border-border hover:border-accent'}`}>
                    <span className="block text-sm font-semibold capitalize text-foreground">{option.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
            {fieldError('role') && <p id="auth-role-error" className="mt-1 text-xs text-danger-600">{fieldError('role')}</p>}
          </fieldset>
        )}

        {isLogin && (
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm font-medium text-foreground hover:underline">Forgot password?</Link>
          </div>
        )}

        <Button type="submit" className="!w-full !rounded-[12px]" disabled={loading} aria-busy={loading}>
          {loading ? 'Please wait…' : isSignup ? 'Create account' : isLogin ? 'Continue to workspace' : isForgot ? 'Preview recovery' : 'Save new password'}
        </Button>

        {(isForgot || isReset) && (
          <p className="text-center text-sm text-muted-foreground">
            Remember your password? <Link href="/login" className="font-semibold text-foreground hover:underline">Sign in</Link>
          </p>
        )}
      </form>

      {(isLogin || isSignup) && (
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {isSignup ? 'Already have an account?' : 'New to RivinityADS?'}{' '}
          <Link href={isSignup ? '/login' : '/signup'} className="font-semibold text-foreground hover:underline">
            {isSignup ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
      )}
    </Card>
  )
}
