import { CONNECTIONS } from '@/lib/constant'
import React from 'react'
import ConnectionCard from './_components/connection-card'
import GoogleDriveListenerCard from './_components/google-drive-listener-card'
import { currentUser } from '@clerk/nextjs/server'
import { onDiscordConnect } from './_actions/discord-connection'
import { onNotionConnect } from './_actions/notion-connection'
import { onSlackConnect } from './_actions/slack-connection'
import { getUserData } from './_actions/get-user'

type Props = {
  searchParams?: { [key: string]: string | undefined }
}

const Connections = async (props: Props) => {
  const {
    webhook_id,
    webhook_name,
    webhook_url,
    guild_id,
    guild_name,
    channel_id,
    access_token,
    workspace_name,
    workspace_icon,
    workspace_id,
    database_id,
    app_id,
    authed_user_id,
    authed_user_token,
    slack_access_token,
    bot_user_id,
    team_id,
    team_name,
  } = props.searchParams ?? {
    webhook_id: '',
    webhook_name: '',
    webhook_url: '',
    guild_id: '',
    guild_name: '',
    channel_id: '',
    access_token: '',
    workspace_name: '',
    workspace_icon: '',
    workspace_id: '',
    database_id: '',
    app_id: '',
    authed_user_id: '',
    authed_user_token: '',
    slack_access_token: '',
    bot_user_id: '',
    team_id: '',
    team_name: '',
  }

  const user = await currentUser()
  if (!user) return null

  const onUserConnections = async () => {
    try {
      console.log('Starting connection setup...')
      
      // Only connect if we have the required params
      if (webhook_id && channel_id) {
        console.log('Connecting Discord...')
        await onDiscordConnect(
          channel_id,
          webhook_id,
          webhook_name || '',
          webhook_url || '',
          user.id,
          guild_name || '',
          guild_id || ''
        )
      }

      if (access_token && workspace_id) {
        console.log('Connecting Notion...')
        await onNotionConnect(
          access_token,
          workspace_id,
          workspace_icon || '',
          workspace_name || '',
          database_id || '',
          user.id
        )
      }

      if (slack_access_token) {
        console.log('Connecting Slack...')
        await onSlackConnect(
          app_id || '',
          authed_user_id || '',
          authed_user_token || '',
          slack_access_token,
          bot_user_id || '',
          team_id || '',
          team_name || '',
          user.id
        )
      }

      console.log('Getting user data...')
      const user_info = await getUserData(user.id)
      console.log('User info:', user_info)

      const connections: any = {}

      //get user info with all connections
      user_info?.connections?.forEach((connection) => {
        connections[connection.type] = true
      })

      // Google Drive connection will always be true
      // as it is given access during the login process
      return { ...connections, 'Google Drive': true }
    } catch (error) {
      console.error('Error in onUserConnections:', error)
      // Return default state on error so page still renders
      return { 'Google Drive': true }
    }
  }

  const connections = await onUserConnections()

  return (
    <div className="relative flex flex-col gap-4">
      <h1 className="sticky top-0 z-[10] flex items-center justify-between border-b bg-background/50 p-6 text-4xl backdrop-blur-lg">
        Connections
      </h1>
      <div className="relative flex flex-col gap-4">
        <section className="flex flex-col gap-4 p-6 text-muted-foreground">
          Connect all your apps directly from here. You may need to connect
          these apps regularly to refresh verification
          
          {/* Google Drive Listener Activation Card */}
          <GoogleDriveListenerCard />
          
          {CONNECTIONS.map((connection) => (
            <ConnectionCard
              key={connection.title}
              description={connection.description}
              title={connection.title}
              icon={connection.image}
              type={connection.title}
              connected={connections}
            />
          ))}
        </section>
      </div>
    </div>
  )
}

export default Connections
