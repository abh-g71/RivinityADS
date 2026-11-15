import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { Budget } from '@/components/landing/Budget'
import { Integrations } from '@/components/landing/Integrations'
import { Pricing } from '@/components/landing/Pricing'
import { Faq } from '@/components/landing/Faq'
import { Footer } from '@/components/landing/Footer'
import { ScrollReveal } from '@/components/landing/ScrollReveal'


export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-slate-50 to-white">
      <Navbar />
      <Hero />
      <ScrollReveal><Features /></ScrollReveal>
      <ScrollReveal><Budget /></ScrollReveal>
      <ScrollReveal><Integrations /></ScrollReveal>
      <ScrollReveal><Pricing /></ScrollReveal>
      <ScrollReveal><Faq /></ScrollReveal>
      <Footer />
    </div>
  )
}