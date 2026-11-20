'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { FormField } from '@/components/shared/FormField'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/shared/PageHeader'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/components/shared/Toast'
import { mockDepositAmountOptions, mockPaymentGroups } from '@/data/advertiser'
import Link from 'next/link'

export default function AddFundsPage() {
  const [method, setMethod] = useState('')
  const [accountType, setAccountType] = useState('Individual')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [touched, setTouched] = useState(false)
  const [success, setSuccess] = useState('')
  const toast = useToast()

  const emailError = !email.trim()
    ? 'Enter an email address.'
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? 'Enter a valid email address.'
      : undefined
  const amountError = Number(amount) > 0 ? undefined : 'Enter an amount greater than zero.'

  function addFunds() {
    setTouched(true)
    if (!method || emailError || amountError) return
    const message = `Mock request created for ₹${Number(amount).toLocaleString('en-IN')} via ${method}. No payment was made.`
    setSuccess(message)
    toast({ title: 'Mock funding request ready', description: 'No payment was initiated.', variant: 'success' })
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        breadcrumbs={[{ label: 'Advertiser' }, { label: 'Add Funds' }]}
        title="Add Funds"
        description="This demo does not connect to payment providers or move money."
        action={<Link href="/finance" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">View finance</Link>}
      />

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold text-foreground">Payment method</h2>
            {mockPaymentGroups.map((group) => (
              <fieldset key={group.title} className="mt-5">
                <legend className="text-sm font-medium text-muted-foreground">{group.title}</legend>
                <div className="mt-2 grid gap-3 sm:grid-cols-3">
                  {group.methods.map((item) => (
                    <label key={item} className="cursor-pointer">
                      <input
                        className="peer sr-only"
                        type="radio"
                        name="funding-method"
                        value={item}
                        checked={method === item}
                        onChange={() => { setMethod(item); setSuccess('') }}
                      />
                      <span className={`flex min-h-16 items-center justify-center rounded-lg border p-4 text-center text-sm font-semibold peer-focus-visible:ring-2 peer-focus-visible:ring-ring ${
                        method === item ? 'border-primary bg-secondary text-foreground' : 'border-border text-foreground hover:border-accent'
                      }`}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            {touched && !method && <p className="mt-3 text-sm text-danger-600" role="alert">Choose a payment method.</p>}
            <div className="mt-5 rounded-lg bg-secondary p-4 text-sm text-muted-foreground">
              <p>Deposit limits: <span className="font-medium">set by platform</span></p>
              <p className="mt-1">Fees: <span className="font-medium">set by platform</span></p>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold text-foreground">Amount</h2>
            <Input
              id="funding-amount"
              label="Amount (₹)"
              name="amount"
              type="number"
              min="1"
              value={amount}
              onChange={(event) => { setAmount(event.target.value); setSuccess('') }}
              onBlur={() => setTouched(true)}
              error={touched ? amountError : undefined}
              placeholder="Enter amount"
            />
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Quick amount choices">
              {mockDepositAmountOptions.map((value) => (
                <Button key={value} type="button" variant="outline" className="px-3 py-2" onClick={() => { setAmount(String(value)); setSuccess('') }}>
                  ₹{value.toLocaleString('en-IN')}
                </Button>
              ))}
            </div>
            <Button type="button" className="mt-5" onClick={addFunds}>Add Funds</Button>
            {success && <p className="mt-3 text-sm text-success-600" role="status">{success}</p>}
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-20">
          <Card className="p-4">
            <h2 className="text-lg font-semibold text-foreground">Account details</h2>
            <p className="mt-1 text-sm text-muted-foreground">Editable demo information for invoice preview only.</p>
            <div className="mt-3 space-y-3">
              <Select
                id="invoice-account-type"
                label="Account type"
                value={accountType}
                onChange={(event) => setAccountType(event.target.value)}
                options={[{ value: 'Individual', label: 'Individual' }, { value: 'Business', label: 'Business' }]}
              />
              <Input id="invoice-email" label="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} onBlur={() => setTouched(true)} error={touched ? emailError : undefined} />
              <FormField id="invoice-address" label="Address">
                <textarea id="invoice-address" rows={3} value={address} onChange={(event) => setAddress(event.target.value)} className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </FormField>
            </div>
          </Card>

          <Card className="flex items-center justify-between gap-4 p-4">
            <div>
              <h2 className="font-semibold text-foreground">Verification</h2>
              <p className="mt-1 text-sm text-muted-foreground">Mock account status</p>
            </div>
            <Badge tone="warning">Not verified</Badge>
          </Card>
        </div>
      </div>
    </div>
  )
}
