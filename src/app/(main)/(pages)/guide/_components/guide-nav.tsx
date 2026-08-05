'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { BookOpen } from 'lucide-react'
import { guideArticles, guideHref } from '@/lib/guide'

const GuideNav = () => {
  const pathName = usePathname()

  const entries = [
    { slug: '', title: 'Overview', Icon: BookOpen },
    ...guideArticles,
  ]

  return (
    <nav className="shrink-0 lg:w-52">
      <ul className="flex flex-row gap-1 overflow-x-auto rounded-lg border p-2 lg:sticky lg:top-6 lg:flex-col lg:overflow-x-visible">
        {entries.map(({ slug, title, Icon }) => {
          const href = guideHref(slug)
          const isActive = pathName === href

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={clsx(
                  'flex items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <Icon
                  className={clsx(
                    'h-4 w-4 shrink-0',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}
                />
                {title}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default GuideNav
