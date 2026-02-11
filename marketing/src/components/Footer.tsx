import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col sm:flex-row justify-between gap-8">
          <div>
            <Logo className="text-xl" />
            <p className="mt-2 text-sm text-text-secondary">
              Easy shared lists for everything.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">Product</h4>
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

            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <a href="/privacy" className="hover:text-text-primary transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-text-primary transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-text-muted">
          &copy; {new Date().getFullYear()} Breezlist. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
