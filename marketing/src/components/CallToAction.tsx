export function CallToAction() {
  return (
    <section className="px-6 py-20 sm:py-28">
      <div className="grad-sky shadow-sky relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] px-8 py-16 text-center">
        <div className="sun-glow pointer-events-none absolute -right-20 -top-40 h-[400px] w-[400px] rounded-full" />
        <h2 className="relative text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Ready to simplify your lists?
        </h2>
        <p className="relative mt-4 text-lg text-white/90">
          Free to use. No credit card required. Start in seconds.
        </p>
        <div className="relative mt-8">
          <a
            href="https://app.breezlist.com/signup"
            className="inline-flex items-center rounded-2xl bg-white px-8 py-3.5 text-lg font-bold text-accent-hover transition-transform hover:-translate-y-0.5"
          >
            Create your first list
          </a>
        </div>
      </div>
    </section>
  )
}
