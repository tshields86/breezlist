import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Breezlist',
  description: 'Terms and conditions for using the Breezlist application.',
}

export default function TermsOfService() {
  return (
    <article className="pt-32 pb-20 mx-auto max-w-3xl px-6">
      <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-text-muted">
        Last updated: February 10, 2026
      </p>

      <div className="mt-10 space-y-8 text-text-secondary leading-relaxed text-[15px]">
        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using Breezlist (the &ldquo;Service&rdquo;), you
            agree to be bound by these Terms of Service. If you do not agree,
            please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            2. Description of Service
          </h2>
          <p>
            Breezlist is a free web application that allows users to create,
            manage, and share lists. The Service is provided &ldquo;as is&rdquo;
            and &ldquo;as available&rdquo; without warranties of any kind.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            3. User Accounts
          </h2>
          <p>
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities that occur under your
            account. You must provide accurate information when creating an
            account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            4. Acceptable Use
          </h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Use the Service for any unlawful purpose</li>
            <li>
              Attempt to gain unauthorized access to the Service or its systems
            </li>
            <li>
              Interfere with or disrupt the Service or servers connected to it
            </li>
            <li>Upload malicious content or spam</li>
            <li>
              Use the Service to harass, abuse, or harm another person
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            5. Your Data
          </h2>
          <p>
            You retain ownership of all content you create on Breezlist. We do
            not claim any intellectual property rights over your lists, items, or
            other content. You can export or delete your data at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            6. Shared Lists
          </h2>
          <p>
            When you share a list with other users, they can view and edit the
            list content. You are responsible for who you share your lists with.
            We are not responsible for how collaborators use shared content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            7. Service Availability
          </h2>
          <p>
            We strive to keep the Service available at all times but do not
            guarantee uninterrupted access. We may modify, suspend, or
            discontinue the Service at any time with reasonable notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            8. Account Termination
          </h2>
          <p>
            We reserve the right to suspend or terminate your account if you
            violate these Terms. You may also delete your account at any time
            through the app settings. Upon termination, your data will be
            permanently deleted.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            9. Limitation of Liability
          </h2>
          <p>
            To the fullest extent permitted by law, Breezlist shall not be liable
            for any indirect, incidental, special, consequential, or punitive
            damages resulting from your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            10. Changes to Terms
          </h2>
          <p>
            We may update these Terms from time to time. We will notify you of
            significant changes by posting a notice on the Service. Continued use
            after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            11. Contact
          </h2>
          <p>
            If you have questions about these Terms, please contact us at{' '}
            <a
              href="mailto:support@breezlist.com"
              className="text-accent hover:underline"
            >
              support@breezlist.com
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  )
}
