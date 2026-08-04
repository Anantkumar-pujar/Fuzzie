import React from 'react'

type Props = { children: React.ReactNode }

const Layout = ({ children }: Props) => {
  return (
    //h-full, not h-screen: this box sits below the infobar, so a full-viewport
    //height would overflow its parent and turn it into a second scroll
    //container - which drags the page's sticky header out of view.
    <div className="h-full overflow-y-auto rounded-l-3xl border-l-[1px] border-t-[1px] border-muted-foreground/20 pb-15">
      {children}
    </div>
  )
}

export default Layout
