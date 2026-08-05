import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'
import {
  Callout,
  CardGrid,
  GuideCard,
  Pill,
  StatCard,
  StatGrid,
  Step,
  Steps,
} from '@/components/guide/mdx-ui'

//Required by the App Router: every .mdx page renders through these. Styling is
//kept close to the dashboard and logs pages - muted body text, foreground
//headings, bordered cards - rather than a typography plugin, so the guide reads
//as part of the app.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="mb-2 text-2xl font-bold text-foreground">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-3 mt-8 text-lg font-semibold text-foreground">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-2 mt-6 text-sm font-semibold text-foreground">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="mb-4 text-sm leading-6 text-muted-foreground">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="mb-4 list-disc space-y-1.5 pl-5 text-sm leading-6 text-muted-foreground">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-4 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-muted-foreground">
        {children}
      </ol>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    code: ({ children }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
        {children}
      </code>
    ),
    hr: () => <hr className="my-8 border-border" />,
    a: ({ href, children }) => {
      const target = href ?? '#'
      return target.startsWith('/') ? (
        <Link
          href={target}
          className="font-medium text-foreground underline underline-offset-4 decoration-muted-foreground/50 hover:decoration-foreground"
        >
          {children}
        </Link>
      ) : (
        <a
          href={target}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-foreground underline underline-offset-4 decoration-muted-foreground/50 hover:decoration-foreground"
        >
          {children}
        </a>
      )
    },
    //Available to every article without an import.
    Callout,
    Steps,
    Step,
    Pill,
    CardGrid,
    GuideCard,
    StatCard,
    StatGrid,
    ...components,
  }
}
