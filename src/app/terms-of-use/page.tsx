import { Metadata } from 'next'
import { EXTERNAL_LINKS } from '@/shared/config/links'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'Terms of Use for the Iced Latte open-source marketplace project.',
}

const sections = [
  {
    title: '1. About the Project',
    body: [
      'Iced Latte is a non-profit, community-driven project created and maintained by Zufar Sunagatov. It serves as a learning sandbox for engineers and as a live demonstration of modern software engineering practices. The platform is not a real commercial store, no real coffee is sold, and no real payments are processed in the demo environment.',
    ],
  },
  {
    title: '2. License & Prohibited Use',
    body: [
      'The source code is licensed under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) license.',
      'You are free to share, copy, redistribute, adapt, remix, transform, and build upon the material, provided that you give appropriate credit to Zufar Sunagatov, provide a link to the license, indicate if changes were made, and do not use the material for commercial purposes.',
    ],
    bullets: [
      'Commercial use of any kind without prior written permission.',
      'Use in educational courses, bootcamps, workshops, tutorials, or training programs, whether free or paid.',
      'Use by companies, organizations, or individuals as a foundation, template, or reference implementation for commercial products or services.',
      'Redistribution under a different license or without proper attribution.',
    ],
  },
  {
    title: '3. User Accounts',
    bullets: [
      'You may create an account using an email address or Google OAuth.',
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
      'By submitting a pull request or other contribution to the Iced Latte repositories, you agree that your contribution is your original work or you have the right to submit it, your contribution is licensed under the same CC BY-NC 4.0 license as the project, and you grant the project maintainers the right to use, modify, and distribute your contribution.',
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
          <div className="border-b border-brand-solid/10 bg-brand-solid px-6 py-8 text-white sm:px-10 sm:py-10">
            <p className="text-xs font-semibold tracking-[0.28em] text-white/60 uppercase">
              Legal
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Terms of Use
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              Welcome to Iced Latte, an open-source specialty coffee
              marketplace. By accessing or using the platform you agree to
              these terms. If you do not agree, please do not use the platform.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/80">
              <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2">
                Effective date: May 3, 2026
              </span>
              <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2">
                Last updated: May 4, 2026
              </span>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <div className="rounded-[24px] border border-brand-solid/10 bg-[#F5FBF7] p-5 text-sm leading-7 text-[#214433]">
              <p>
                Source of truth for this text lives in the backend repository at{' '}
                <a
                  href={EXTERNAL_LINKS.github.termsSource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand underline decoration-brand/30 underline-offset-4 transition hover:decoration-brand"
                >
                  docs/terms-of-use.md
                </a>
                .
              </p>
            </div>

            <div className="mt-10 space-y-10 text-[#1E1E1A]">
              {sections.map((section) => (
                <section key={section.title} className="space-y-4">
                  <h2 className="text-2xl font-semibold tracking-tight text-brand">
                    {section.title}
                  </h2>

                  {section.body?.map((paragraph) => (
                    <p key={paragraph} className="text-[15px] leading-8 text-black/75">
                      {paragraph}
                    </p>
                  ))}

                  {section.bullets && (
                    <ul className="space-y-3 pl-5 text-[15px] leading-8 text-black/75 marker:text-brand">
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
                <h2 className="text-2xl font-semibold tracking-tight text-brand">
                  12. Contact
                </h2>
                <p className="text-[15px] leading-8 text-black/75">
                  For questions, concerns, or requests regarding these terms:
                </p>
                <ul className="space-y-3 pl-5 text-[15px] leading-8 text-black/75 marker:text-brand">
                  <li>
                    Email:{' '}
                    <a
                      href={EXTERNAL_LINKS.email}
                      className="text-brand underline decoration-brand/25 underline-offset-4 transition hover:decoration-brand"
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
                      className="text-brand underline decoration-brand/25 underline-offset-4 transition hover:decoration-brand"
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
                      className="text-brand underline decoration-brand/25 underline-offset-4 transition hover:decoration-brand"
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
                    className="font-medium text-brand underline decoration-brand/30 underline-offset-4 transition hover:decoration-brand"
                  >
                    CC BY-NC 4.0 legal code
                  </a>
                  . Contributors can also review the{' '}
                  <a
                    href={EXTERNAL_LINKS.github.contributing}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand underline decoration-brand/30 underline-offset-4 transition hover:decoration-brand"
                  >
                    Contributing Guide
                  </a>
                  .
                </p>
                <p className="mt-4">
                  <Link
                    href="/"
                    className="font-medium text-brand underline decoration-brand/30 underline-offset-4 transition hover:decoration-brand"
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
