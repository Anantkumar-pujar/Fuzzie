'use server'

import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'

export const onDisconnectDiscord = async () => {
  const user = await currentUser()
  if (!user) {
    return { success: false, message: 'User not authenticated' }
  }

  try {
    // Delete Discord webhook
    await db.discordWebhook.deleteMany({
      where: {
        userId: user.id,
      },
    })

    // Delete Discord connections
    await db.connections.deleteMany({
      where: {
        userId: user.id,
        type: 'Discord',
      },
    })

    return { success: true, message: 'Discord disconnected successfully' }
  } catch (error) {
    console.error('Error disconnecting Discord:', error)
    return { success: false, message: 'Failed to disconnect Discord' }
  }
}

export const onDisconnectNotion = async () => {
  const user = await currentUser()
  if (!user) {
    return { success: false, message: 'User not authenticated' }
  }

  try {
    // Delete Notion records
    await db.notion.deleteMany({
      where: {
        userId: user.id,
      },
    })

    // Delete Notion connections
    await db.connections.deleteMany({
      where: {
        userId: user.id,
        type: 'Notion',
      },
    })

    return { success: true, message: 'Notion disconnected successfully' }
  } catch (error) {
    console.error('Error disconnecting Notion:', error)
    return { success: false, message: 'Failed to disconnect Notion' }
  }
}

export const onDisconnectSlack = async () => {
  const user = await currentUser()
  if (!user) {
    return { success: false, message: 'User not authenticated' }
  }

  try {
    // Delete Slack records
    await db.slack.deleteMany({
      where: {
        userId: user.id,
      },
    })

    // Delete Slack connections
    await db.connections.deleteMany({
      where: {
        userId: user.id,
        type: 'Slack',
      },
    })

    return { success: true, message: 'Slack disconnected successfully' }
  } catch (error) {
    console.error('Error disconnecting Slack:', error)
    return { success: false, message: 'Failed to disconnect Slack' }
  }
}
