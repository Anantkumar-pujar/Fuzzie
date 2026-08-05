'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Book } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { findGuideForPath, guideArticles, guideHref } from '@/lib/guide'

const GuideDrawer = () => {
  const pathName = usePathname()
  const [open, setOpen] = useState(false)

  //The infobar renders on every page, so the panel can lead with help for
  //whatever the user is currently looking at.
  const contextual = findGuideForPath(pathName)
  const close = () => setOpen(false)

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
    >
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <SheetTrigger
              aria-label="Open the guide"
              className="rounded-md p-1 text-foreground transition-colors hover:bg-muted"
            >
              <Book />
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Guide</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <SheetContent
        side="right"
        className="flex flex-col gap-6 overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Guide</SheetTitle>
          <SheetDescription>
            Short answers here, or open the full guide for the detail.
          </SheetDescription>
        </SheetHeader>

        {contextual && (
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              On this page
            </p>
            <p className="mt-2 font-semibold text-foreground">
              {contextual.title}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {contextual.summary}
            </p>
            <Link
              href={guideHref(contextual.slug)}
              onClick={close}
              className="mt-3 inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
            >
              Read the full guide
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            All articles
          </p>
          {guideArticles.map(({ slug, title, Icon }) => (
            <Link
              key={slug}
              href={guideHref(slug)}
              onClick={close}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {title}
            </Link>
          ))}
        </div>

        <Link
          href={guideHref('')}
          onClick={close}
          className="mt-auto inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
        >
          Browse the whole guide
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </SheetContent>
    </Sheet>
  )
}

export default GuideDrawer
