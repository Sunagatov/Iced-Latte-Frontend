import Link from 'next/link'
import { EXTERNAL_LINKS } from '@/shared/config/links'
import { ROUTES } from '@/shared/config/routes'

export const TERMS_EFFECTIVE_DATE = 'May 3, 2026'
export const TERMS_LAST_UPDATED = 'June 4, 2026'

export const termsSections = [
  {
    title: '1. About the Project',
    body: [
      'Iced Latte is a non-profit, community-driven project created and maintained by Zufar Sunagatov. It serves as a learning sandbox for engineers and as a live demonstration of modern software engineering practices. The platform is not a real commercial store, no real coffee is sold, and no real payments are processed in the demo environment.',
    ],
  },
  {
    title: '2. Repository License',
    body: [
      'The repository source code and related repository material are licensed under the Apache License 2.0 in the repository LICENSE file.',
      'That license allows open-source use, modification, distribution, private use, and commercial use subject to its terms.',
      'The Apache License 2.0 does not grant rights to use the Iced Latte name, logo, domain, visual identity, or other brand assets in a way that suggests official endorsement, partnership, or ownership without explicit written permission.',
    ],
  },
  {
    title: '3. User Accounts',
    bullets: [
      'You may create an account using an email address, Google OAuth, or GitHub OAuth.',
      'You are responsible for keeping your credentials secure.',
      'You must provide accurate information during registration.',
      'We reserve the right to suspend or delete accounts that violate these terms.',
    ],
  },
  {
    title: '4. Acceptable Use',
    body: ['You agree not to:'],
    bullets: [
      'Use the platform for any unlawful purpose.',
      'Attempt to gain unauthorized access to any part of the platform, its servers, or databases.',
      'Scrape, crawl, or use automated tools to extract data beyond normal API usage.',
      'Upload malicious content, spam, or any material that infringes on the rights of others.',
      'Impersonate another person or misrepresent your affiliation with any entity.',
      'Interfere with or disrupt the platform\'s infrastructure.',
    ],
  },
  {
    title: '5. Intellectual Property',
    bullets: [
      'The Iced Latte name, logo, and branding are the property of Zufar Sunagatov.',
      'Product images, descriptions, and sample data on the platform are for demonstration purposes only.',
      'User-generated content such as reviews and ratings remains the property of the respective users, but by submitting content you grant Iced Latte a non-exclusive, royalty-free license to display it on the platform.',
    ],
  },
  {
    title: '6. Privacy & Data',
    bullets: [
      'We collect only the data necessary to operate the platform: email, name, and authentication tokens.',
      'Passwords are hashed using Argon2 and are never stored in plain text.',
      'We do not sell, share, or rent your personal data to third parties.',
      'You may request deletion of your account and associated data by contacting zufar.sunagatov@gmail.com.',
    ],
    calloutTitle: 'No Guarantee of Data Safety',
    calloutBody: [
      'This project is a personal pet project and is not operated as a professional or enterprise-grade service. Although the platform is deployed to a production environment and is publicly accessible, the author does not guarantee the safety, security, integrity, confidentiality, or availability of any data, including personal information, account credentials, uploaded content, or any other data, at any stage of processing, storage, or transmission.',
      'By using this platform, you acknowledge and accept that data may be lost, corrupted, or exposed due to bugs, infrastructure failures, or security vulnerabilities, the platform may be taken offline, reset, or wiped at any time without prior notice, no backups, disaster recovery, or data retention guarantees are provided, and you use this platform entirely at your own risk. Do not store sensitive, confidential, or irreplaceable information on this platform.',
    ],
  },
  {
    title: '7. Payments',
    body: [
      'All payment functionality on this platform is strictly educational and demonstrative. No real financial transactions are processed. The platform integrates with Stripe in test mode only to demonstrate payment flow implementation.',
    ],
    bullets: [
      'No real money is charged, transferred, or held.',
      'No real goods or services are sold or delivered.',
      'Credit card numbers entered in the demo environment are processed by Stripe\'s test sandbox and are not real charges.',
      'The author assumes no liability for any financial loss arising from misuse or misunderstanding of the payment demonstration features.',
    ],
  },
  {
    title: '8. Availability & Warranties',
    bullets: [
      'This platform is a personal pet project. It is provided as is and as available without warranties of any kind, whether express, implied, or statutory, including merchantability, fitness for a particular purpose, and non-infringement.',
      'We do not guarantee uninterrupted, timely, secure, or error-free operation.',
      'We may modify, suspend, or discontinue any part of the platform at any time without notice.',
      'The platform should not be relied upon for any production, business, or mission-critical purpose.',
    ],
  },
  {
    title: '9. Limitation of Liability',
    body: [
      'To the maximum extent permitted by applicable law, Zufar Sunagatov and the Iced Latte contributors shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including loss of data, loss of profits, or loss of goodwill, arising from or related to your use of, or inability to use, the platform, regardless of the theory of liability.',
    ],
  },
  {
    title: '10. Contributing',
    body: [
      'By submitting a pull request, issue patch, code suggestion, documentation change, design, test, or any other contribution to the Iced Latte repositories, you agree that:',
    ],
    bullets: [
      'Your contribution is your original work or you have the right to submit it.',
      'Contributions are accepted under the project\'s Apache License 2.0 contribution terms.',
      'Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in Iced Latte is submitted under Apache License 2.0, without any additional terms or conditions.',
      'By submitting a contribution, you confirm that you have the right to submit it and that it can be licensed as part of the project under Apache License 2.0.',
      'You must not submit code, text, images, designs, assets, test data, or other material that you do not have the right to contribute.',
      'If you do not agree with these contribution terms, do not submit a contribution.',
    ],
  },
  {
    title: '11. Changes to These Terms',
    body: [
      'We may update these Terms of Use from time to time. Changes will be reflected by updating the Last updated date at the top of this document. Continued use of the platform after changes constitutes acceptance of the updated terms.',
    ],
  },
]

export default function TermsOfUsePage() {
  return (
    <section className="bg-[linear-gradient(180deg,#f7f3eb_0%,#f8f7f4_24%,#ffffff_100%)]">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:px-12">
        <div className="overflow-hidden rounded-[32px] border border-black/6 bg-white shadow-[0_24px_80px_rgba(27,67,50,0.08)]">
          <div className="border-brand-solid/10 bg-brand-solid border-b px-6 py-8 text-white sm:px-10 sm:py-10">
            <p className="text-xs font-semibold tracking-[0.28em] text-white/60 uppercase">
              Legal
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Terms of Use
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              Welcome to Iced Latte, an open-source specialty coffee
              marketplace. By accessing or using the platform you agree to these
              terms. If you do not agree, please do not use the platform.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/80">
              <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2">
                Effective date: {TERMS_EFFECTIVE_DATE}
              </span>
              <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2">
                Last updated: {TERMS_LAST_UPDATED}
              </span>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <div className="border-brand-solid/10 rounded-[24px] border bg-[#F5FBF7] p-5 text-sm leading-7 text-[#214433]">
              <p>
                Source of truth for this text lives in the backend repository at{' '}
                <a
                  href={EXTERNAL_LINKS.github.termsSource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand decoration-brand/30 hover:decoration-brand font-medium underline underline-offset-4 transition"
                >
                  docs/terms-of-use.md
                </a>
                .
              </p>
            </div>

            <div className="mt-10 space-y-10 text-[#1E1E1A]">
              {termsSections.map((section) => (
                <section key={section.title} className="space-y-4">
                  <h2 className="text-brand text-2xl font-semibold tracking-tight">
                    {section.title}
                  </h2>

                  {section.body?.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-[15px] leading-8 text-black/75"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {section.bullets && (
                    <ul className="marker:text-brand space-y-3 pl-5 text-[15px] leading-8 text-black/75">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}

                  {section.calloutTitle && (
                    <div className="rounded-[24px] border border-amber-200 bg-amber-50/80 p-6">
                      <h3 className="text-lg font-semibold text-amber-950">
                        {section.calloutTitle}
                      </h3>
                      <div className="mt-3 space-y-4 text-[15px] leading-8 text-amber-950/85">
                        {section.calloutBody?.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              ))}

              <section className="space-y-4">
                <h2 className="text-brand text-2xl font-semibold tracking-tight">
                  12. Contact
                </h2>
                <p className="text-[15px] leading-8 text-black/75">
                  For questions, concerns, or requests regarding these terms:
                </p>
                <ul className="marker:text-brand space-y-3 pl-5 text-[15px] leading-8 text-black/75">
                  <li>
                    Email:{' '}
                    <a
                      href={EXTERNAL_LINKS.email}
                      className="text-brand decoration-brand/25 hover:decoration-brand underline underline-offset-4 transition"
                    >
                      zufar.sunagatov@gmail.com
                    </a>
                  </li>
                  <li>
                    Telegram:{' '}
                    <a
                      href={EXTERNAL_LINKS.social.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand decoration-brand/25 hover:decoration-brand underline underline-offset-4 transition"
                    >
                      @lucky_1uck
                    </a>
                  </li>
                  <li>
                    GitHub Issues:{' '}
                    <a
                      href={EXTERNAL_LINKS.github.issues}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand decoration-brand/25 hover:decoration-brand underline underline-offset-4 transition"
                    >
                      github.com/Sunagatov/Iced-Latte/issues
                    </a>
                  </li>
                </ul>
              </section>

              <div className="rounded-[24px] border border-black/6 bg-[#FAF8F2] p-6 text-sm leading-7 text-black/70">
                <p>
                  Need the full license text? See{' '}
                  <a
                    href={EXTERNAL_LINKS.license}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand decoration-brand/30 hover:decoration-brand font-medium underline underline-offset-4 transition"
                  >
                    Apache License 2.0 legal code
                  </a>
                  . Contributors can also review the{' '}
                  <a
                    href={EXTERNAL_LINKS.github.contributing}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand decoration-brand/30 hover:decoration-brand font-medium underline underline-offset-4 transition"
                  >
                    Contributing Guide
                  </a>
                  .
                </p>
                <p className="mt-4">
                  <Link
                    href={ROUTES.home}
                    className="text-brand decoration-brand/30 hover:decoration-brand font-medium underline underline-offset-4 transition"
                  >
                    Return to the marketplace
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
