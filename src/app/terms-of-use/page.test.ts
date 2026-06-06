import fs from 'node:fs'
import path from 'node:path'
import {
  TERMS_EFFECTIVE_DATE,
  TERMS_LAST_UPDATED,
  termsSections,
} from '@/features/auth/routes/TermsOfUsePage'

const backendTermsPath = path.resolve(
  process.cwd(),
  '../Iced-Latte/docs/terms-of-use.md',
)
const maybeDescribe = fs.existsSync(backendTermsPath) ? describe : describe.skip

function extractMarkdownValue(markdown: string, label: string): string {
  const match = markdown.match(new RegExp(`\\*\\*${label}:\\*\\*\\s+(.+)`))

  if (!match) {
    throw new Error(`Missing ${label} in backend terms source`)
  }

  return match[1].trim()
}

maybeDescribe('terms of use source sync', () => {
  const backendTerms = fs.readFileSync(backendTermsPath, 'utf8')

  it('keeps frontend effective and last-updated dates aligned with backend terms', () => {
    expect(TERMS_EFFECTIVE_DATE).toBe(
      extractMarkdownValue(backendTerms, 'Effective date'),
    )
    expect(TERMS_LAST_UPDATED).toBe(
      extractMarkdownValue(backendTerms, 'Last updated'),
    )
  })

  it('keeps frontend section headings aligned with backend terms', () => {
    const backendHeadings = Array.from(
      backendTerms.matchAll(/^##\s+(.+)$/gm),
      ([, heading]) => heading,
    )
    const frontendHeadings = [
      ...termsSections.map((section) => section.title),
      '12. Contact',
    ]

    expect(frontendHeadings).toEqual(backendHeadings)
  })
})
