'use client'

import { ConnectionTypes } from '@/lib/types'
import React, { useState } from 'react'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  onDisconnectDiscord,
  onDisconnectNotion,
  onDisconnectSlack,
} from '../_actions/disconnect-integrations'

type Props = {
  type: ConnectionTypes
  icon: string
  title: ConnectionTypes
  description: string
  callback?: () => void
  connected: {} & any
}

const ConnectionCard = ({
  description,
  type,
  icon,
  title,
  connected,
}: Props) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const router = useRouter()

  const isPrimaryIntegration = title === 'Google Drive'

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      let result

      if (title === 'Discord') {
        result = await onDisconnectDiscord()
      } else if (title === 'Notion') {
        result = await onDisconnectNotion()
      } else if (title === 'Slack') {
        result = await onDisconnectSlack()
      }

      if (result?.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result?.message || 'Failed to disconnect')
      }
    } catch (error) {
      toast.error('An error occurred while disconnecting')
      console.error('Disconnect error:', error)
    } finally {
      setIsDisconnecting(false)
      setShowConfirmDialog(false)
    }
  }

  return (
    <>
      <Card className="flex w-full items-center justify-between">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-row gap-2">
            <Image
              src={icon}
              alt={title}
              height={30}
              width={30}
              className="object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
        <div className="flex flex-col items-center gap-2 p-4">
          {connected[type] ? (
            isPrimaryIntegration ? (
              <div className="rounded-lg border-2 border-primary bg-primary px-3 py-2 font-bold text-primary-foreground">
                Connected
              </div>
            ) : (
              <Button
                variant="destructive"
                onClick={() => setShowConfirmDialog(true)}
                disabled={isDisconnecting}
                className="font-bold"
              >
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            )
          ) : (
            <Link
              href={
                title == 'Discord'
                  ? process.env.NEXT_PUBLIC_DISCORD_REDIRECT!
                  : title == 'Notion'
                  ? process.env.NEXT_PUBLIC_NOTION_AUTH_URL!
                  : title == 'Slack'
                  ? process.env.NEXT_PUBLIC_SLACK_REDIRECT!
                  : '#'
              }
              className=" rounded-lg bg-primary p-2 font-bold text-primary-foreground"
            >
              Connect
            </Link>
          )}
        </div>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect {title}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect this integration? This will
              stop all related automations and notifications. Any workflows
              using this integration will no longer function until you reconnect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDisconnecting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default ConnectionCard
