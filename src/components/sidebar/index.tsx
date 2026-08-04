'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { menuOptions } from '@/lib/constant'
import clsx from 'clsx'
import { Separator } from '@/components/ui/separator'
import { Database, GitBranch, LucideMousePointerClick } from 'lucide-react'
import { ModeToggle } from '../global/mode-toggle'

type Props = {}

//Decorative workflow preview shown under the menu.
const workflowPreviewNodes = [
  { Icon: LucideMousePointerClick, className: 'text-gray-700 dark:text-white' },
  { Icon: GitBranch, className: 'text-gray-600 dark:text-muted-foreground' },
  { Icon: Database, className: 'text-gray-600 dark:text-muted-foreground' },
  { Icon: GitBranch, className: 'text-gray-600 dark:text-muted-foreground' },
]

const MenuOptions = (props: Props) => {
  const pathName = usePathname()

  return (
    <nav className="flex h-full w-20 shrink-0 flex-col items-center gap-8 overflow-y-auto px-2 py-6 dark:bg-black">
      <Link
        className="shrink-0 font-bold"
        href="/"
      >
        fuzzie.
      </Link>
      <TooltipProvider>
        <ul className="flex shrink-0 flex-col items-center gap-8">
          {menuOptions.map((menuItem) => (
            <li key={menuItem.name}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={menuItem.href}
                    aria-current={
                      pathName === menuItem.href ? 'page' : undefined
                    }
                    className={clsx(
                      'group flex h-8 w-8 scale-[1.5] cursor-pointer items-center justify-center rounded-lg p-[3px]',
                      {
                        'bg-[#EEE0FF] dark:bg-[#2F006B]':
                          pathName === menuItem.href,
                      }
                    )}
                  >
                    <menuItem.Component selected={pathName === menuItem.href} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-black/10 backdrop-blur-xl"
                >
                  <p>{menuItem.name}</p>
                </TooltipContent>
              </Tooltip>
            </li>
          ))}
        </ul>
      </TooltipProvider>
      <Separator className="shrink-0" />
      {/* All four nodes plus their gaps, padding and borders measure 290px, so
      the cap stops the preview stretching into an empty capsule on tall
      screens. Below that it takes the room that is left and scrolls inside. */}
      <div
        aria-hidden
        className="flex max-h-[292px] min-h-0 flex-1 flex-col items-center gap-9 overflow-y-auto rounded-full border-[1px] border-gray-300 bg-gray-100 px-2 py-4 dark:border-[#353346] dark:bg-[#353346]/30"
      >
        {workflowPreviewNodes.map(({ Icon, className }, index) => (
          <div
            key={index}
            className="relative shrink-0 rounded-full border-[1px] bg-white p-2 dark:border-t-[2px] dark:border-t-[#353346] dark:bg-[#353346]/70"
          >
            <Icon
              className={className}
              size={18}
            />
            {index < workflowPreviewNodes.length - 1 && (
              <div className="absolute -bottom-[30px] left-1/2 h-6 -translate-x-1/2 border-l-2 border-muted-foreground/50" />
            )}
          </div>
        ))}
      </div>
      {/* mt-auto pins the toggle to the bottom once the preview stops growing. */}
      <div className="mt-auto shrink-0">
        <ModeToggle />
      </div>
    </nav>
  )
}

export default MenuOptions
