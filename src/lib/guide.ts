//Table of contents for the in-app guide.
//
//This is the single source of truth: the guide's own side navigation, the
//contextual help panel in the infobar, and (later) the command palette all read
//from it, so adding an article here is the only step needed to surface it
//everywhere.

import {
  CreditCard,
  LifeBuoy,
  Rocket,
  Send,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export type GuideArticle = {
  //Empty slug is the guide index at /guide.
  slug: string
  title: string
  summary: string
  //Shown in the guide nav and on the overview cards.
  Icon: LucideIcon
  //App routes this article explains. Used to pick the contextual help shown by
  //the infobar's guide button; matched by longest prefix.
  routes: string[]
}

export const guideArticles: GuideArticle[] = [
  {
    slug: 'quickstart',
    title: 'Quickstart',
    summary: 'Get from an empty account to a workflow running on its own.',
    Icon: Rocket,
    routes: ['/dashboard', '/workflows', '/settings'],
  },
  {
    slug: 'triggers',
    title: 'Triggers',
    summary: 'How the Google Drive listener works and why it needs activating.',
    Icon: Zap,
    routes: ['/connections'],
  },
  {
    slug: 'actions',
    title: 'Actions',
    summary: 'What Discord, Slack and Notion each need before they will run.',
    Icon: Send,
    routes: ['/workflows/editor'],
  },
  {
    slug: 'credits-and-billing',
    title: 'Credits & billing',
    summary: 'What costs a credit and what happens when you run out.',
    Icon: CreditCard,
    routes: ['/billing'],
  },
  {
    slug: 'troubleshooting',
    title: 'Troubleshooting',
    summary: 'Read the Logs page and fix the usual causes of a silent workflow.',
    Icon: LifeBuoy,
    routes: ['/logs'],
  },
]

export const guideHref = (slug: string) => (slug ? `/guide/${slug}` : '/guide')

//Picks the article whose declared route best matches the current pathname, so
///workflows/editor/<id> resolves to Actions rather than Quickstart.
export const findGuideForPath = (pathname: string): GuideArticle | undefined => {
  let match: { article: GuideArticle; length: number } | undefined

  for (const article of guideArticles) {
    for (const route of article.routes) {
      if (
        (pathname === route || pathname.startsWith(`${route}/`)) &&
        (!match || route.length > match.length)
      ) {
        match = { article, length: route.length }
      }
    }
  }

  return match?.article
}
