import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-8">
          <div>
            <Logo className="text-2xl" />
            <p className="mt-3 max-w-sm text-sm text-text-secondary leading-relaxed">
              Easy shared lists for everything. Create, share, and collaborate on
              groceries, todos, packing lists, and more.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <a href="#features" className="hover:text-text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-text-primary transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="https://app.breezlist.com"
                  className="hover:text-text-primary transition-colors"
                >
                  Open App
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row sm:justify-between gap-2 text-xs text-text-muted">
          <span>&copy; {new Date().getFullYear()} Breezlist. All rights reserved.</span>
          <div>
            <a href="/privacy" className="hover:text-text-primary transition-colors">
              Privacy Policy
            </a>
            <span className="mx-2">&middot;</span>
            <a href="/terms" className="hover:text-text-primary transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
