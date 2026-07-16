'use client'

import { type ReactNode } from 'react'
import { useReveal } from '@/hooks/useReveal'

interface Feature {
  title: string
  description: string
  icon: ReactNode
}

const features: Feature[] = [
  {
    title: 'Real-time sync',
    description: 'Changes appear instantly for everyone on the list. No refresh, no conflicts.',
    icon: (
      <path d="M21 12a9 9 0 1 1-3-6.7M21 4v4h-4" />
    ),
  },
  {
    title: 'Smart re-adding',
    description: 'Breezlist remembers what you buy. Re-add your regulars in a tap.',
    icon: (
      <path d="M12 8v4l3 2M3 12a9 9 0 1 0 4-7.5M3 5v4h4" />
    ),
  },
  {
    title: 'Templates',
    description: 'Save weekly groceries or a packing list once. Reuse it forever.',
    icon: (
      <path d="M4 5h16M4 12h16M4 19h10" />
    ),
  },
  {
    title: 'Works offline',
    description: 'A true PWA. Add it to your home screen; it works without signal.',
    icon: (
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
    ),
  },
  {
    title: 'Light & dark',
    description: 'Easy on the eyes, day or night. Follows your system automatically.',
    icon: (
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    ),
  },
  {
    title: 'Share by link',
    description: 'One tap to invite. Viewers don’t even need an account.',
    icon: (
      <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
    ),
  },
]

export function Features() {
  const { ref, visible } = useReveal<HTMLDivElement>(0.15)

  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6" ref={ref}>
        <div className="mb-14 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Features</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Built for simplicity. Every feature earns its place.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`shadow-soft rounded-2xl border border-border bg-bg-secondary p-6 transition-colors hover:border-accent/40 ${
                visible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="grad-chip mb-4 grid h-11 w-11 place-items-center rounded-xl text-accent">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {feature.icon}
                </svg>
              </div>
              <h3 className="text-lg font-bold text-text-primary">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
