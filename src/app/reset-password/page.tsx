import { AuthForm } from '@/components/landing/AuthForm'
import { AuthLayout } from '@/components/landing/AuthLayout'

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <AuthForm mode="reset-password" />
    </AuthLayout>
  )
}
