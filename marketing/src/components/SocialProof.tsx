const testimonials = [
  {
    quote: 'Finally, a list app that doesn’t try to be a project manager.',
    author: 'Karen K.',
    role: 'Weekly groceries',
  },
  {
    quote: 'My wife and I share a house list. It just works.',
    author: 'Travis S.',
    role: 'Household lists',
  },
  {
    quote: 'I use templates for every family trip. Packing has never been easier.',
    author: 'Nina T.',
    role: 'Family travel',
  },
]

export function SocialProof() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
          Used by teams, families &amp; friends
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.author} className="glass rounded-2xl p-6 text-left">
              <blockquote className="text-[15px] leading-relaxed text-text-primary">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-4">
                <p className="text-sm font-bold text-text-primary">{testimonial.author}</p>
                <p className="text-xs text-text-muted">{testimonial.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
