import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { Faq } from '@/components/landing/Faq'
import { Footer } from '@/components/landing/Footer'


export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <Faq />
      <Footer />
    </div>
  )
}