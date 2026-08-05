'use client'
import { useEffect, useState } from 'react'

export type SearchResults = {
  workflows: {
    id: string
    name: string
    description: string
    publish: boolean | null
  }[]
  connections: { id: string; type: string }[]
  executions: {
    id: string
    status: string
    createdAt: string
    workflowId: string
    workflowName: string
  }[]
}

const empty: SearchResults = { workflows: [], connections: [], executions: [] }

//Debounced, abortable entity search. Every keystroke cancels the request in
//flight so a slow early query can never overwrite the results of a later one.
export const useEntitySearch = (query: string, enabled: boolean) => {
  const [results, setResults] = useState<SearchResults>(empty)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()

    if (!enabled || trimmed.length < 2) {
      setResults(empty)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        )
        if (!response.ok) throw new Error(`Search failed: ${response.status}`)

        //An expired session is redirected to the sign-in page, which answers
        //with HTML and a 200. Parsing that as JSON would throw, so treat any
        //non-JSON body as "no results" rather than an error.
        if (
          !response.headers.get('content-type')?.includes('application/json')
        ) {
          setResults(empty)
          return
        }

        setResults((await response.json()) as SearchResults)
      } catch (error) {
        //An abort is the expected outcome for superseded keystrokes.
        if ((error as Error).name !== 'AbortError') {
          console.error('Search request failed:', error)
          setResults(empty)
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 180)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, enabled])

  return { results, loading }
}
