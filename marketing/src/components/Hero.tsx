import { Logo } from './Logo'

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6 text-center">
        <div className="animate-fade-in-up">
          <Logo className="text-5xl sm:text-6xl" />
        </div>

        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary animate-fade-in-up-delay-1">
          Simple shared lists
          <br />
          that actually work
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-text-secondary animate-fade-in-up-delay-2">
          Stop texting lists back and forth. Create, share, and collaborate in
          real-time. Groceries, todos, packing, gifts, and more.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up-delay-3">
          <a
            href="https://app.breezlist.com/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-accent text-white font-semibold text-lg hover:bg-accent-hover transition-colors shadow-lg shadow-accent/25"
          >
            Get Started, It&apos;s Free
          </a>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl border border-border text-text-secondary font-medium text-lg hover:bg-bg-secondary transition-colors"
          >
            See How It Works
          </a>
        </div>

        {/* Phone mockup */}
        <div className="mt-16 mx-auto max-w-sm">
          <div className="relative mx-auto w-[280px] h-[560px] rounded-[3rem] border-4 border-border bg-bg-secondary shadow-2xl overflow-hidden">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-bg-primary rounded-b-2xl" />

            {/* Screen content */}
            <div className="mt-10 px-4 space-y-3">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-text-primary">Grocery List</span>
                <span className="text-xs text-text-muted">Shared with 2</span>
              </div>

              {[
                { text: 'Avocados', checked: false },
                { text: 'Sourdough bread', checked: false },
                { text: 'Oat milk', checked: false },
                { text: 'Cherry tomatoes', checked: false },
                { text: 'Pasta', checked: true },
                { text: 'Olive oil', checked: true },
              ].map((item) => (
                <div
                  key={item.text}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                    item.checked ? 'bg-bg-tertiary/50' : 'bg-bg-primary'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      item.checked
                        ? 'border-accent bg-accent'
                        : 'border-border'
                    }`}
                  >
                    {item.checked && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      item.checked
                        ? 'line-through text-text-muted'
                        : 'text-text-primary'
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
