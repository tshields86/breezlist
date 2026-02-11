export function SocialProof() {
  return (
    <section className="py-20 sm:py-28 bg-bg-secondary">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="text-lg sm:text-xl text-text-secondary">
          Used by teams, families, and friends to stay organized.
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              quote: 'Finally, a list app that doesn\'t try to be a project manager.',
              author: 'Sarah K.',
              role: 'Uses for weekly groceries',
            },
            {
              quote: 'My roommates and I share a house list. It just works.',
              author: 'Marcus T.',
              role: 'Shared household lists',
            },
            {
              quote: 'I use templates for every family trip. Packing has never been easier.',
              author: 'Priya M.',
              role: 'Family travel planning',
            },
          ].map((testimonial) => (
            <div
              key={testimonial.author}
              className="p-6 rounded-2xl border border-border bg-bg-primary text-left"
            >
              <p className="text-text-primary text-sm leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-4">
                <p className="text-sm font-semibold text-text-primary">
                  {testimonial.author}
                </p>
                <p className="text-xs text-text-muted">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
