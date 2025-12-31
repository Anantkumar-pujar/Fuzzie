'use server'
import { Option } from '@/components/ui/multiple-selector'
import { db } from '@/lib/db'
import { auth, currentUser } from '@clerk/nextjs/server'

export const getGoogleListener = async () => {
  const { userId } = await auth()

  if (userId) {
    const listener = await db.user.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        googleResourceId: true,
      },
    })

    if (listener) {
      return listener
    }
  }
}

export const onFlowPublish = async (workflowId: string, state: boolean) => {
  const published = await db.workflows.update({
    where: {
      id: workflowId,
    },
    data: {
      publish: state,
    },
  })

  if (published.publish) return 'Workflow published'
  return 'Workflow unpublished'
}

export const onCreateNodeTemplate = async (
  content: string,
  type: string,
  workflowId: string,
  channels?: Option[],
  accessToken?: string,
  notionDbId?: string
) => {
  if (type === 'Discord') {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        discordTemplate: content,
      },
    })

    if (response) {
      return 'Discord template saved'
    }
  }
  if (type === 'Slack') {
    // Get current channels
    const workflow = await db.workflows.findUnique({
      where: { id: workflowId },
      select: { slackChannels: true },
    })

    // Combine existing channels with new ones and remove duplicates
    const existingChannels = workflow?.slackChannels || []
    const newChannelValues = channels?.map(c => c.value) || []
    const allChannels = Array.from(new Set([...existingChannels, ...newChannelValues]))

    // Update workflow with template, token, and all channels in one operation
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        slackTemplate: content,
        slackAccessToken: accessToken,
        slackChannels: allChannels,
      },
    })

    if (response) {
      return 'Slack template saved'
    }
  }

  if (type === 'Notion') {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        notionTemplate: content,
        notionAccessToken: accessToken,
        notionDbId: notionDbId || null,
      },
    })

    if (response) return 'Notion template saved'
  }
}

export const onGetWorkflows = async () => {
  const user = await currentUser()
  if (user) {
    const workflows = await db.workflows.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (workflows) return workflows
  }
}

export const onCreateWorkflow = async (name: string, description: string) => {
  const user = await currentUser()

  if (user) {
    //create new workflow
    const workflow = await db.workflows.create({
      data: {
        userId: user.id,
        name,
        description,
      },
    })

    if (workflow) return { message: 'workflow created' }
    return { message: 'Oops! try again' }
  }
}

export const onGetNodesEdges = async (flowId: string) => {
  const nodesEdges = await db.workflows.findUnique({
    where: {
      id: flowId,
    },
    select: {
      nodes: true,
      edges: true,
      discordTemplate: true,
      slackTemplate: true,
      notionTemplate: true,
      slackChannels: true,
      slackAccessToken: true,
      notionAccessToken: true,
      notionDbId: true,
    },
  })
  if (nodesEdges?.nodes && nodesEdges?.edges) return nodesEdges
}
