import { AuthForm } from '@/components/landing/AuthForm'
import { AuthLayout } from '@/components/landing/AuthLayout'

export default function LoginPage() {
  return (
    <AuthLayout>
      <AuthForm mode="login" />
    </AuthLayout>
  )
}
