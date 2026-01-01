'use server'

import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'
import { Client } from '@notionhq/client'

export const onNotionConnect = async (
  access_token: string,
  workspace_id: string,
  workspace_icon: string,
  workspace_name: string,
  database_id: string,
  id: string
) => {
  'use server'
  if (access_token) {
    //check if notion is connected
    const notion_connected = await db.notion.findFirst({
      where: {
        accessToken: access_token,
      },
      include: {
        connections: {
          select: {
            type: true,
          },
        },
      },
    })

    if (!notion_connected) {
      //create connection
      await db.notion.create({
        data: {
          userId: id,
          workspaceIcon: workspace_icon!,
          accessToken: access_token,
          workspaceId: workspace_id!,
          workspaceName: workspace_name!,
          databaseId: database_id,
          connections: {
            create: {
              userId: id,
              type: 'Notion',
            },
          },
        },
      })
    }
  }
}
export const getNotionConnection = async () => {
  const user = await currentUser()
  if (user) {
    const connection = await db.notion.findFirst({
      where: {
        userId: user.id,
      },
    })
    if (connection) {
      return connection
    }
  }
}

export const getNotionDatabase = async (
  databaseId: string,
  accessToken: string
) => {
  const notion = new Client({
    auth: accessToken,
  })
  const response = await notion.databases.retrieve({ database_id: databaseId })
  return response
}

export const onCreateNewPageInDatabase = async (
  databaseId: string,
  accessToken: string,
  content: string | { [key: string]: any }
) => {
  // Validate inputs
  if (!databaseId || databaseId.trim() === '') {
    throw new Error('Database ID is required but was empty or undefined. Please configure your Notion connection with a valid database ID.')
  }
  
  if (!accessToken || accessToken.trim() === '') {
    throw new Error('Access token is required. Please reconnect your Notion account.')
  }

  try {
    const notion = new Client({
      auth: accessToken,
    })
    
    const contentText = typeof content === 'string' ? content : content.content || JSON.stringify(content)

    const response = await notion.pages.create({
      parent: {
        type: 'database_id',
        database_id: databaseId.trim(),
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: contentText.substring(0, 2000), // Notion has a 2000 char limit for title
              },
            },
          ],
        },
      },
    })
    
    if (response) {
      return response
    }
  } catch (error: any) {
    console.error('Notion API error:', error)
    if (error.code === 'object_not_found') {
      throw new Error(`Database not found. Please verify the database ID in your Notion connection settings.`)
    } else if (error.code === 'unauthorized') {
      throw new Error(`Unauthorized access to Notion. Please reconnect your Notion account.`)
    } else {
      throw new Error(`Notion API error: ${error.message || 'Unknown error occurred'}`)
    }
  }
}
