import { AuthForm } from '@/components/landing/AuthForm'
import { AuthLayout } from '@/components/landing/AuthLayout'

export default function SignupPage() {
  return (
    <AuthLayout>
      <AuthForm mode="signup" />
    </AuthLayout>
  )
}
