import React, { useCallback } from 'react'
import { Option } from './content-based-on-title'
import { ConnectionProviderProps } from '@/providers/connections-provider'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { postContentToWebHook } from '@/app/(main)/(pages)/connections/_actions/discord-connection'
import { onCreateNodeTemplate } from '../../../_actions/workflow-connections'
import { toast } from 'sonner'
import { onCreateNewPageInDatabase } from '@/app/(main)/(pages)/connections/_actions/notion-connection'
import { postMessageToSlack } from '@/app/(main)/(pages)/connections/_actions/slack-connection'

type Props = {
  currentService: string
  nodeConnection: ConnectionProviderProps
  channels?: Option[]
  setChannels?: (value: Option[]) => void
}

const ActionButton = ({
  currentService,
  nodeConnection,
  channels,
  setChannels,
}: Props) => {
  const pathname = usePathname()

  const onSendDiscordMessage = useCallback(async () => {
    const response = await postContentToWebHook(
      nodeConnection.discordNode.content,
      nodeConnection.discordNode.webhookURL
    )

    if (response.message == 'success') {
      nodeConnection.setDiscordNode((prev: any) => ({
        ...prev,
        content: '',
      }))
    }
  }, [nodeConnection])

  const onStoreNotionContent = useCallback(async () => {
    // Validate Notion configuration before sending
    if (!nodeConnection.notionNode.databaseId || nodeConnection.notionNode.databaseId.trim() === '') {
      toast.error('Notion database ID is not configured. Please reconnect Notion in the Connections page.')
      return
    }
    
    if (!nodeConnection.notionNode.accessToken) {
      toast.error('Notion access token is missing. Please reconnect Notion in the Connections page.')
      return
    }
    
    if (!nodeConnection.notionNode.content || (nodeConnection.notionNode.content as string).trim() === '') {
      toast.error('Please enter some content to save to Notion.')
      return
    }

    console.log(
      'Notion Config:',
      nodeConnection.notionNode.databaseId,
      nodeConnection.notionNode.accessToken,
      nodeConnection.notionNode.content
    )
    
    try {
      const response = await onCreateNewPageInDatabase(
        nodeConnection.notionNode.databaseId.trim(),
        nodeConnection.notionNode.accessToken,
        nodeConnection.notionNode.content
      )
      if (response) {
        toast.success('Successfully created page in Notion!')
        nodeConnection.setNotionNode((prev: any) => ({
          ...prev,
          content: '',
        }))
      }
    } catch (error: any) {
      toast.error(`Failed to create Notion page: ${error.message}`)
      console.error('Notion error:', error)
    }
  }, [nodeConnection])

  const onStoreSlackContent = useCallback(async () => {
    const response = await postMessageToSlack(
      nodeConnection.slackNode.slackAccessToken,
      channels!,
      nodeConnection.slackNode.content
    )
    if (response.message == 'Success') {
      toast.success('Message sent successfully')
      nodeConnection.setSlackNode((prev: any) => ({
        ...prev,
        content: '',
      }))
      setChannels!([])
    } else {
      toast.error(response.message)
    }
  }, [nodeConnection, channels, setChannels])

  const onCreateLocalNodeTempate = useCallback(async () => {
    if (currentService === 'Discord') {
      const response = await onCreateNodeTemplate(
        nodeConnection.discordNode.content,
        currentService,
        pathname.split('/').pop()!
      )

      if (response) {
        toast.message(response)
      }
    }
    if (currentService === 'Slack') {
      const response = await onCreateNodeTemplate(
        nodeConnection.slackNode.content,
        currentService,
        pathname.split('/').pop()!,
        channels,
        nodeConnection.slackNode.slackAccessToken
      )

      if (response) {
        toast.message(response)
      }
    }

    if (currentService === 'Notion') {
      // Validate Notion configuration before saving template
      if (!nodeConnection.notionNode.databaseId || nodeConnection.notionNode.databaseId.trim() === '') {
        toast.error('Notion database ID is not configured. Please set it up in the Connections page.')
        return
      }
      
      if (!nodeConnection.notionNode.accessToken) {
        toast.error('Notion access token is missing. Please reconnect Notion.')
        return
      }
      
      const response = await onCreateNodeTemplate(
        JSON.stringify(nodeConnection.notionNode.content),
        currentService,
        pathname.split('/').pop()!,
        [],
        nodeConnection.notionNode.accessToken,
        nodeConnection.notionNode.databaseId.trim()
      )

      if (response) {
        toast.message(response)
      }
    }
  }, [nodeConnection, channels, currentService, pathname])

  const renderActionButton = () => {
    switch (currentService) {
      case 'Discord':
        return (
          <>
            <Button
              variant="outline"
              onClick={onSendDiscordMessage}
            >
              Test Message
            </Button>
            <Button
              onClick={onCreateLocalNodeTempate}
              variant="outline"
            >
              Save Template
            </Button>
          </>
        )

      case 'Notion':
        return (
          <>
            <Button
              variant="outline"
              onClick={onStoreNotionContent}
            >
              Test
            </Button>
            <Button
              onClick={onCreateLocalNodeTempate}
              variant="outline"
            >
              Save Template
            </Button>
          </>
        )

      case 'Slack':
        return (
          <>
            <Button
              variant="outline"
              onClick={onStoreSlackContent}
            >
              Send Message
            </Button>
            <Button
              onClick={onCreateLocalNodeTempate}
              variant="outline"
            >
              Save Template
            </Button>
          </>
        )

      default:
        return null
    }
  }
  return renderActionButton()
}

export default ActionButton
