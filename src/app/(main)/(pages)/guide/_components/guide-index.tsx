import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { guideArticles, guideHref } from '@/lib/guide'

//Article cards on the guide overview, rendered straight from lib/guide so a new
//article never has to be linked by hand.
const GuideIndex = () => {
  return (
    <div className="my-6 grid gap-4 sm:grid-cols-2">
      {guideArticles.map(({ slug, title, summary, Icon }) => (
        <Link
          key={slug}
          href={guideHref(slug)}
          className="group"
        >
          <Card className="h-full transition-colors hover:bg-accent/50">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <CardDescription className="text-xs leading-5">
                {summary}
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

export default GuideIndex
