import React from 'react'
import clsx from 'clsx'
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

//Presentational pieces the guide's .mdx files use. They are registered globally
//in src/mdx-components.tsx, so articles can use them without importing.

type CalloutVariant = 'note' | 'warn' | 'tip'

const calloutStyles: Record<
  CalloutVariant,
  { wrapper: string; icon: string; Icon: typeof Info }
> = {
  note: {
    wrapper: 'border-border bg-muted/40',
    icon: 'text-muted-foreground',
    Icon: Info,
  },
  warn: {
    wrapper: 'border-amber-500/30 bg-amber-500/10',
    icon: 'text-amber-500',
    Icon: AlertTriangle,
  },
  tip: {
    wrapper: 'border-green-500/30 bg-green-500/10',
    icon: 'text-green-500',
    Icon: CheckCircle2,
  },
}

export const Callout = ({
  variant = 'note',
  children,
}: {
  variant?: CalloutVariant
  children: React.ReactNode
}) => {
  const { wrapper, icon, Icon } = calloutStyles[variant]

  return (
    <div className={clsx('my-4 flex gap-3 rounded-lg border p-4', wrapper)}>
      <Icon className={clsx('mt-0.5 h-4 w-4 shrink-0', icon)} />
      <div className="text-sm leading-6 text-muted-foreground [&>*:last-child]:mb-0 [&>p]:mb-2 [&_strong]:text-foreground">
        {children}
      </div>
    </div>
  )
}

export const Steps = ({ children }: { children: React.ReactNode }) => (
  <ol className="my-6 flex flex-col gap-4">{children}</ol>
)

export const Step = ({
  n,
  title,
  children,
}: {
  n: number
  title: string
  children?: React.ReactNode
}) => (
  <li className="flex gap-4">
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-muted text-xs font-semibold text-foreground">
      {n}
    </span>
    <div className="min-w-0 flex-1 pt-0.5">
      <p className="font-medium text-foreground">{title}</p>
      {children && (
        <div className="mt-1 text-sm leading-6 text-muted-foreground [&>*:last-child]:mb-0">
          {children}
        </div>
      )}
    </div>
  </li>
)

export const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 font-mono text-xs text-foreground">
    {children}
  </span>
)

export const CardGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="my-6 grid gap-4 sm:grid-cols-2">{children}</div>
)

export const GuideCard = ({
  title,
  meta,
  children,
}: {
  title: string
  meta?: string
  children: React.ReactNode
}) => (
  <Card>
    <CardHeader className="pb-2 pt-4">
      <CardTitle className="text-base">{title}</CardTitle>
      {meta && <CardDescription className="text-xs">{meta}</CardDescription>}
    </CardHeader>
    <CardContent className="pb-4 text-sm leading-6 text-muted-foreground [&>*:last-child]:mb-0">
      {children}
    </CardContent>
  </Card>
)

//Matches the stat cards on the dashboard and logs pages.
export const StatCard = ({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'green' | 'red' | 'default'
}) => (
  <Card>
    <CardHeader className="pb-2 pt-4">
      <CardDescription className="text-xs">{label}</CardDescription>
    </CardHeader>
    <CardContent className="pb-4">
      <div
        className={clsx(
          'text-2xl font-bold',
          tone === 'green' && 'text-green-500',
          tone === 'red' && 'text-red-500'
        )}
      >
        {value}
      </div>
    </CardContent>
  </Card>
)

export const StatGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="my-6 grid grid-cols-2 gap-4 lg:grid-cols-3">{children}</div>
)
