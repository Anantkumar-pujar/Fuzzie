'use client'
import React, { useEffect } from 'react'
import { ModeToggle } from '../global/mode-toggle'
import { Headphones } from 'lucide-react'
import GuideDrawer from './guide-drawer'
import QuickSearch from '@/components/search/quick-search'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { UserButton } from '@clerk/nextjs'
import { useBilling } from '@/providers/billing-provider'
import { onPaymentDetails } from '@/app/(main)/(pages)/billing/_actions/payment-connecetions'

type Props = {}

const InfoBar = (props: Props) => {
  const { credits, tier, setCredits, setTier } = useBilling()

  useEffect(() => {
    const onGetPayment = async () => {
      try {
        const response = await onPaymentDetails()
        if (response) {
          setTier(response.tier!)
          setCredits(response.credits!)
        }
      } catch (error) {
        console.error('Error fetching payment details:', error)
      }
    }

    onGetPayment()
  }, [setTier, setCredits])

  return (
    <div className="flex w-full shrink-0 flex-row items-center justify-end gap-6 px-4 py-4 dark:bg-black">
      <span className="flex items-center gap-2 font-bold">
        <p className="text-sm font-light text-gray-600 dark:text-gray-300">Credits</p>
        {tier == 'Unlimited' ? (
          <span>Unlimited</span>
        ) : (
          <span>
            {credits}/{tier == 'Free' ? '10' : tier == 'Pro' && '100'}
          </span>
        )}
      </span>
      <QuickSearch />
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>
            <Headphones />
          </TooltipTrigger>
          <TooltipContent>
            <p>Contact Support</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <GuideDrawer />
      <UserButton />
    </div>
  )
}

export default InfoBar
