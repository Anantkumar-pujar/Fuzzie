'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  BookOpen,
  CreditCard,
  Link2,
  Loader2,
  Moon,
  Plus,
  Search,
  Sun,
  Workflow,
} from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { menuOptions } from '@/lib/constant'
import { guideArticles, guideHref } from '@/lib/guide'
import { useEntitySearch } from './use-entity-search'

const statusTone: Record<string, string> = {
  success: 'text-green-500',
  failed: 'text-red-500',
}

const QuickSearch = () => {
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const { results, loading } = useEntitySearch(query, open)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((previous) => !previous)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  //Clear the query on close so the palette always reopens fresh.
  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const run = useCallback((action: () => void) => {
    setOpen(false)
    action()
  }, [])

  const go = useCallback(
    (href: string) => run(() => router.push(href)),
    [run, router]
  )

  //Static entries are filtered here rather than by cmdk, because entity results
  //are already filtered server side and mixing the two makes matching
  //inconsistent.
  const needle = query.trim().toLowerCase()
  const matches = (...fields: string[]) =>
    !needle || fields.some((field) => field.toLowerCase().includes(needle))

  const pages = menuOptions.filter((page) => matches(page.name))
  const articles = guideArticles.filter((article) =>
    matches(article.title, article.summary)
  )

  const actions = [
    {
      id: 'new-workflow',
      label: 'Create a workflow',
      Icon: Plus,
      run: () => go('/workflows'),
    },
    {
      id: 'connect-app',
      label: 'Connect an app',
      Icon: Link2,
      run: () => go('/connections'),
    },
    {
      id: 'upgrade',
      label: 'Upgrade plan',
      Icon: CreditCard,
      run: () => go('/billing'),
    },
    {
      id: 'theme',
      label: resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
      Icon: resolvedTheme === 'dark' ? Sun : Moon,
      run: () => run(() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')),
    },
  ].filter((action) => matches(action.label))

  const hasEntities =
    results.workflows.length > 0 ||
    results.connections.length > 0 ||
    results.executions.length > 0
  const hasAnything =
    pages.length > 0 || articles.length > 0 || actions.length > 0 || hasEntities

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open quick search"
        className="flex w-full max-w-xs items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Quick Search</span>
        <kbd className="pointer-events-none hidden select-none items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px] font-medium sm:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="overflow-hidden p-0 shadow-lg">
          <DialogTitle className="sr-only">Quick search</DialogTitle>
          <Command
            shouldFilter={false}
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2.5"
          >
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search workflows, runs and pages..."
            />
            <CommandList className="max-h-[380px]">
              {!hasAnything && !loading && (
                <CommandEmpty>No results found.</CommandEmpty>
              )}

              {loading && (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </div>
              )}

              {results.workflows.length > 0 && (
                <CommandGroup heading="Workflows">
                  {results.workflows.map((workflow) => (
                    <CommandItem
                      key={workflow.id}
                      value={`workflow-${workflow.id}`}
                      onSelect={() => go(`/workflows/editor/${workflow.id}`)}
                    >
                      <Workflow className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 truncate">{workflow.name}</span>
                      <CommandShortcut>
                        {workflow.publish ? 'Published' : 'Draft'}
                      </CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results.executions.length > 0 && (
                <CommandGroup heading="Recent runs">
                  {results.executions.map((execution) => (
                    <CommandItem
                      key={execution.id}
                      value={`execution-${execution.id}`}
                      onSelect={() => go('/logs')}
                    >
                      <Workflow className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 truncate">
                        {execution.workflowName}
                      </span>
                      <CommandShortcut
                        className={statusTone[execution.status] ?? ''}
                      >
                        {execution.status}
                      </CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results.connections.length > 0 && (
                <CommandGroup heading="Connections">
                  {results.connections.map((connection) => (
                    <CommandItem
                      key={connection.id}
                      value={`connection-${connection.id}`}
                      onSelect={() => go('/connections')}
                    >
                      <Link2 className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 truncate">{connection.type}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {pages.length > 0 && (
                <>
                  {hasEntities && <CommandSeparator />}
                  <CommandGroup heading="Pages">
                    {pages.map((page) => (
                      <CommandItem
                        key={page.href}
                        value={`page-${page.href}`}
                        onSelect={() => go(page.href)}
                      >
                        <page.Component selected={false} />
                        <span className="ml-2 flex-1">{page.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}

              {actions.length > 0 && (
                <CommandGroup heading="Actions">
                  {actions.map((action) => (
                    <CommandItem
                      key={action.id}
                      value={`action-${action.id}`}
                      onSelect={action.run}
                    >
                      <action.Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{action.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {articles.length > 0 && (
                <CommandGroup heading="Guide">
                  {articles.map((article) => (
                    <CommandItem
                      key={article.slug}
                      value={`guide-${article.slug}`}
                      onSelect={() => go(guideHref(article.slug))}
                    >
                      <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 truncate">{article.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default QuickSearch
