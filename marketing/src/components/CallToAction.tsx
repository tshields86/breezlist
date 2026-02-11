export function CallToAction() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
          Ready to simplify your lists?
        </h2>
        <p className="mt-4 text-lg text-text-secondary">
          Free to use. No credit card required. Start in seconds.
        </p>
        <div className="mt-8">
          <a
            href="https://app.breezlist.com/signup"
            className="inline-flex items-center px-8 py-3.5 rounded-xl bg-accent text-white font-semibold text-lg hover:bg-accent-hover transition-colors shadow-lg shadow-accent/25"
          >
            Create Your First List
          </a>
        </div>
      </div>
    </section>
  )
}
