import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-brand-700">404 · Page not found</p>
        <h1 className="mt-3 text-3xl font-bold text-navy-900">This page isn’t here</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">The address may be incorrect, or the page may have moved. Head back to the RivinityADS home page to continue exploring.</p>
        <Link href="/" className="mt-6 inline-flex rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
          Go to home
        </Link>
      </div>
    </main>
  )
}
