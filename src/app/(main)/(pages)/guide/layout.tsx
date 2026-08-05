import React from 'react'
import GuideNav from './_components/guide-nav'

type Props = { children: React.ReactNode }

const GuideLayout = ({ children }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="sticky top-0 z-[10] flex items-center justify-between border-b bg-background/50 p-6 text-4xl backdrop-blur-lg">
        <span>Guide</span>
      </h1>
      <div className="flex flex-col gap-6 p-6 pb-8 lg:flex-row lg:gap-8">
        <GuideNav />
        <article className="min-w-0 max-w-2xl flex-1">{children}</article>
      </div>
    </div>
  )
}

export default GuideLayout
