'use client'

import { useReveal } from '@/hooks/useReveal'

const steps = [
  {
    number: '1',
    title: 'Make a list',
    description:
      'Start typing. Smart suggestions pull from what you’ve added before, so re-stocking is instant.',
  },
  {
    number: '2',
    title: 'Share a link',
    description:
      'Send one link. No account needed to open it. Everyone sees the same list, live.',
  },
  {
    number: '3',
    title: 'Check off together',
    description:
      'Tap to complete. Items sink to the bottom and sync to everyone in real time.',
  },
]

export function HowItWorks() {
  const { ref, visible } = useReveal<HTMLDivElement>(0.2)

  return (
    <section id="how-it-works" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6" ref={ref}>
        <div className="mb-14 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">How it works</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
            From idea to shared list in under a minute
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`shadow-soft rounded-2xl border border-border bg-bg-secondary p-7 ${
                visible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="grad-dawn grid h-10 w-10 place-items-center rounded-xl text-base font-extrabold text-text-primary">
                {step.number}
              </div>
              <h3 className="mt-4 text-xl font-bold text-text-primary">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
