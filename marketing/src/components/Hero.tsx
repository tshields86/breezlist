const heroItems = [
  { text: 'Avocados', qty: '×3', starred: true, done: false },
  { text: 'Sourdough', qty: null, starred: false, done: false },
  { text: 'Cherry tomatoes', qty: null, starred: false, done: false },
  { text: 'Oat milk', qty: null, starred: false, done: true },
  { text: 'Olive oil', qty: null, starred: false, done: true },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Dawn sky */}
      <div className="grad-dawn absolute inset-0 -z-10 opacity-90" />
      <div className="sun-glow absolute -top-40 left-1/2 -z-10 h-[560px] w-[560px] -translate-x-1/2 rounded-full" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="text-center lg:text-left">
          <p className="animate-fade-in-up text-xs font-bold uppercase tracking-[0.18em] text-accent">
            Shared lists, the easy way
          </p>
          <h1 className="animate-fade-in-up-delay-1 mt-4 text-5xl font-extrabold leading-[1.02] tracking-tight text-text-primary sm:text-6xl lg:text-7xl">
            Lists that feel
            <br className="hidden sm:block" /> like a <span className="grad-text">breeze</span>.
          </h1>
          <p className="animate-fade-in-up-delay-2 mx-auto mt-6 max-w-xl text-lg text-text-secondary lg:mx-0">
            Make a list, share a link, check things off together — in real time.
            Groceries, packing, gifts, to-dos, anything.
          </p>

          <div className="animate-fade-in-up-delay-3 mt-9 flex flex-col items-center gap-3 sm:flex-row sm:gap-4 lg:justify-start">
            <a
              href="https://app.breezlist.com/signup"
              className="grad-sky shadow-sky inline-flex w-full items-center justify-center rounded-2xl px-7 py-3.5 text-lg font-bold text-white transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              Start a list — it&apos;s free
            </a>
            <a
              href="#how-it-works"
              className="glass inline-flex w-full items-center justify-center rounded-2xl px-7 py-3.5 text-lg font-semibold text-text-primary transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              See how it works
            </a>
          </div>

          <div className="animate-fade-in-up-delay-3 mt-7 flex items-center justify-center gap-3 text-sm text-text-secondary lg:justify-start">
            <div className="flex">
              {['A', 'M', 'J'].map((initial, i) => (
                <span
                  key={initial}
                  className="grad-sky grid h-8 w-8 place-items-center rounded-full border-2 border-bg-primary text-xs font-bold text-white"
                  style={{ marginLeft: i === 0 ? 0 : '-0.5rem' }}
                >
                  {initial}
                </span>
              ))}
            </div>
            Loved by households, roommates &amp; trip planners
          </div>
        </div>

        {/* Floating glass list card */}
        <div className="animate-floaty glass shadow-soft mx-auto w-full max-w-sm rounded-[1.75rem] p-5">
          <div className="flex items-center justify-between px-1 pb-3.5">
            <span className="text-base font-extrabold text-text-primary">🛒 Grocery run</span>
            <span className="text-xs font-bold text-accent">Shared with 2</span>
          </div>
          <ul>
            {heroItems.map((item, i) => (
              <li
                key={item.text}
                className={`flex items-center gap-3 py-3 ${i > 0 ? 'border-t border-border/70' : ''}`}
              >
                <span
                  className={`grid h-[22px] w-[22px] flex-none place-items-center rounded-full border-2 ${
                    item.done ? 'grad-sky border-transparent' : 'border-text-muted/40'
                  }`}
                >
                  {item.done && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12l5 5L20 6" />
                    </svg>
                  )}
                </span>
                <span className={`text-[15px] font-medium ${item.done ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                  {item.text}
                </span>
                {item.qty && <span className="text-xs font-semibold text-text-muted">{item.qty}</span>}
                {!item.done && (
                  <span className={`ml-auto text-[15px] ${item.starred ? 'text-star' : 'text-text-muted/40'}`}>
                    {item.starred ? '★' : '☆'}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
