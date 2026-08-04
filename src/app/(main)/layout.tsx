import React from 'react'
import Sidebar from '@/components/sidebar'
import InfoBar from '@/components/infobar'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

type Props = { children: React.ReactNode }

const Layout = async (props: Props) => {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  //dvh keeps the shell the size of the visible viewport on mobile browsers,
  //where 100vh sits behind the address bar; h-screen is the fallback.
  return (
    <div className="flex h-screen overflow-hidden supports-[height:100dvh]:h-dvh">
      <Sidebar />
      {/* min-w-0 keeps the content column from squeezing the sidebar when its
      own content (credits, search) is wider on one account than another. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <InfoBar />
        {/* The (pages) layout owns the scrolling, so this stays overflow-hidden
        - a second scroll container here would break the sticky page headers. */}
        <main className="flex-1 overflow-hidden">{props.children}</main>
      </div>
    </div>
  )
}

export default Layout
