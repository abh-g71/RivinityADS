import Link from 'next/link'
import { ArrowRight, Megaphone, Play, Sparkles } from 'lucide-react'

export function Hero() {
  return (
    <section className="landing-hero">
      <div className="landing-hero-copy">
        <div className="landing-hero-badge">
          <Megaphone className="h-4 w-4" aria-hidden="true" />
          RivinityADS advertising platform
        </div>
        <h1 className="landing-hero-title">
          Run ads in minutes.<br />
          <span className="landing-hero-title-accent">Earn from your website.</span>
        </h1>
        <p className="landing-hero-description">
          RivinityADS is an ad network. Advertisers launch campaigns, and publishers earn from the ads on their sites.
        </p>

        <div className="landing-hero-actions">
          <Link href="/signup" className="landing-hero-primary">
            Start advertising
            <span className="landing-hero-arrow"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
          </Link>
          <Link href="/signup" className="landing-hero-secondary">
            <Play className="h-4 w-4" aria-hidden="true" />
            Start earning
          </Link>
        </div>

        <Link href="/campaigns/new/ai" className="landing-demo-link">
          <Sparkles className="h-4 w-4 shrink-0 text-[#7C48D2]" aria-hidden="true" />
          <span className="landing-demo-text">Promote my clothing store in Delhi, ₹500 a day</span>
          <span className="landing-demo-try">Try it <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
        </Link>
        <p className="landing-hero-note">The assistant is a demo · All numbers on this page are sample data</p>
      </div>

      <div className="landing-hero-visual" role="img" aria-label="Neutral photo area for a campaign image">
        <div className="landing-photo-slot" aria-hidden="true" />
        <div className="landing-floating-card" aria-label="Sample campaign card">
          <p className="landing-floating-card-label">Campaign overview</p>
          <p className="landing-floating-card-title">Spring collection</p>
          <span className="landing-floating-card-status"><span className="h-2 w-2 rounded-full bg-[#7C48D2]" /> Sample data</span>
        </div>
      </div>
    </section>
  )
}
