import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <Logo withMark markSize={30} className="text-xl" />
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              Easy shared lists for everything. Create, share, and collaborate on
              groceries, to-dos, packing lists, and more.
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <h4 className="mb-3 text-sm font-bold text-text-primary">Product</h4>
              <ul className="space-y-2.5 text-sm text-text-secondary">
                <li><a href="#features" className="hover:text-text-primary transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-text-primary transition-colors">How it works</a></li>
                <li><a href="https://app.breezlist.com" className="hover:text-text-primary transition-colors">Open app</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold text-text-primary">Company</h4>
              <ul className="space-y-2.5 text-sm text-text-secondary">
                <li><a href="/privacy" className="hover:text-text-primary transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-text-primary transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-xs text-text-muted">
          <span>&copy; {new Date().getFullYear()} Breezlist. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
