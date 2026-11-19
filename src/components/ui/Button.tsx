import type { ButtonHTMLAttributes } from 'react'
import Link from 'next/link'
import type { LinkProps } from 'next/link'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const baseStyles =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none'

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  secondary: 'bg-primary text-white hover:bg-primary/90',
  outline: 'border border-border bg-white text-foreground hover:bg-muted',
  ghost: 'text-muted-foreground hover:bg-muted',
}

const linkBaseStyles =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none'

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    />
  )
}

type ButtonLinkProps = LinkProps & {
  variant?: ButtonVariant
  className?: string
  children: React.ReactNode
}

export function ButtonLink({
  variant = 'primary',
  className = '',
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={`${linkBaseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    />
  )
}
