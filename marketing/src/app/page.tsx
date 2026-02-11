import { Hero } from '@/components/Hero'
import { HowItWorks } from '@/components/HowItWorks'
import { Features } from '@/components/Features'
import { SocialProof } from '@/components/SocialProof'
import { CallToAction } from '@/components/CallToAction'

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <SocialProof />
      <CallToAction />
    </>
  )
}
