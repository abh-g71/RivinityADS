import { AuthForm } from '@/components/landing/AuthForm'
import { AuthLayout } from '@/components/landing/AuthLayout'

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <AuthForm mode="forgot-password" />
    </AuthLayout>
  )
}
