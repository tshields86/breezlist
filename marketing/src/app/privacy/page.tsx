import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Breezlist',
  description: 'Learn how Breezlist collects, uses, and protects your personal data.',
}

export default function PrivacyPolicy() {
  return (
    <article className="pt-32 pb-20 mx-auto max-w-3xl px-6">
      <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-text-muted">
        Last updated: February 10, 2026
      </p>

      <div className="mt-10 space-y-8 text-text-secondary leading-relaxed text-[15px]">
        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            1. Introduction
          </h2>
          <p>
            Breezlist (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;)
            is committed to protecting your privacy. This Privacy Policy explains
            how we collect, use, and safeguard your information when you use our
            web application at app.breezlist.com (the &ldquo;Service&rdquo;).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            2. Information We Collect
          </h2>
          <h3 className="font-semibold text-text-primary mt-4 mb-2">
            Account Information
          </h3>
          <p>
            When you create an account, we collect your email address and, if you
            sign in with Google, your name and profile picture. We use this to
            authenticate you and personalize your experience.
          </p>
          <h3 className="font-semibold text-text-primary mt-4 mb-2">
            List Data
          </h3>
          <p>
            We store the lists and items you create so they can be synced across
            your devices and shared with collaborators. This data is stored
            securely in our database.
          </p>
          <h3 className="font-semibold text-text-primary mt-4 mb-2">
            Usage Analytics
          </h3>
          <p>
            We collect anonymized, aggregated analytics to understand how the
            Service is used and to improve it. We do not track individual users
            or sell this data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            3. How We Use Your Information
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide, maintain, and improve the Service</li>
            <li>To authenticate your identity and secure your account</li>
            <li>To enable list sharing and real-time collaboration</li>
            <li>To send important service-related communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            4. Third-Party Services
          </h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>
              <strong>Supabase</strong> — Database hosting, authentication, and
              real-time sync (hosted in the US)
            </li>
            <li>
              <strong>Vercel</strong> — Web hosting and analytics
            </li>
            <li>
              <strong>Google</strong> — OAuth sign-in (only if you choose Google
              login)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            5. Data Sharing
          </h2>
          <p>
            We do not sell, trade, or rent your personal information to third
            parties. We only share data with the third-party services listed
            above, as necessary to operate the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            6. Your Rights
          </h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>
              <strong>Access</strong> your personal data at any time through the
              app
            </li>
            <li>
              <strong>Delete</strong> your account and all associated data
            </li>
            <li>
              <strong>Export</strong> your list data in a portable format
            </li>
            <li>
              <strong>Correct</strong> any inaccurate information
            </li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, contact us at{' '}
            <a
              href="mailto:travis.shields@gmail.com"
              className="text-accent hover:underline"
            >
              travis.shields@gmail.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            7. Data Security
          </h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your data, including encryption in transit (TLS) and at rest.
            However, no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            8. Cookies
          </h2>
          <p>
            We use essential cookies only — for authentication and storing your
            theme preference (dark/light mode). We do not use tracking cookies or
            third-party advertising cookies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            9. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of any material changes by posting the new policy on this page
            and updating the &ldquo;Last updated&rdquo; date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            10. Contact Us
          </h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at{' '}
            <a
              href="mailto:travis.shields@gmail.com"
              className="text-accent hover:underline"
            >
              travis.shields@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  )
}
