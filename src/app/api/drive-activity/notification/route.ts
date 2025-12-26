import { postContentToWebHook } from '@/app/(main)/(pages)/connections/_actions/discord-connection'
import { onCreateNewPageInDatabase } from '@/app/(main)/(pages)/connections/_actions/notion-connection'
import { postMessageToSlack } from '@/app/(main)/(pages)/connections/_actions/slack-connection'
import { db } from '@/lib/db'
import axios from 'axios'
import { headers } from 'next/headers'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  console.log('🔴 Google Drive Change Detected')
  
  try {
    const headersList = headers()
    let channelResourceId: string | undefined
    
    headersList.forEach((value, key) => {
      if (key === 'x-goog-resource-id') {
        channelResourceId = value
      }
    })

    if (!channelResourceId) {
      console.warn('⚠️ No x-goog-resource-id header found')
      return Response.json(
        { message: 'No resource ID provided' },
        { status: 400 }
      )
    }

    // Find user by Google resource ID
    const user = await db.user.findFirst({
      where: {
        googleResourceId: channelResourceId,
      },
      select: { clerkId: true, credits: true },
    })

    if (!user) {
      console.warn(`⚠️ No user found for resource ID: ${channelResourceId}`)
      return Response.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has credits
    const hasCredits = user.credits === 'Unlimited' || parseInt(user.credits || '0') > 0
    
    if (!hasCredits) {
      console.warn(`⚠️ User ${user.clerkId} has insufficient credits`)
      return Response.json(
        { message: 'Insufficient credits' },
        { status: 403 }
      )
    }

    // Get published workflows
    const workflows = await db.workflows.findMany({
      where: {
        userId: user.clerkId,
        publish: true,
      },
    })

    if (!workflows || workflows.length === 0) {
      console.log(`ℹ️ No published workflows found for user ${user.clerkId}`)
      return Response.json(
        { message: 'No published workflows to execute' },
        { status: 200 }
      )
    }

    console.log(`✅ Found ${workflows.length} published workflow(s) to execute`)

    // Execute all workflows
    const results = await Promise.allSettled(
      workflows.map(async (flow) => {
        try {
          console.log(`▶️ Executing workflow: ${flow.name} (${flow.id})`)
          
          if (!flow.flowPath) {
            console.warn(`⚠️ Workflow ${flow.id} has no flowPath`)
            return { success: false, error: 'No flowPath defined' }
          }

          const flowPath = JSON.parse(flow.flowPath)
          
          // Execute all actions in the flow path
          // With multiple incoming connections, actions may appear multiple times
          // We'll execute each action once (deduplication handled by array traversal)
          const executedActions = new Set<string>()
          let current = 0

          while (current < flowPath.length) {
            const action = flowPath[current]
            
            // Skip if already executed (for parallel paths that converge)
            if (executedActions.has(action)) {
              console.log(`  ⏭️ Skipping ${action} (already executed)`)
              flowPath.splice(current, 1)
              continue
            }
            
            console.log(`  ➜ Executing action: ${action}`)
            executedActions.add(action)

            try {
              if (action === 'Discord') {
                const discordMessage = await db.discordWebhook.findFirst({
                  where: { userId: flow.userId },
                  select: { url: true },
                })
                
                if (discordMessage && flow.discordTemplate) {
                  await postContentToWebHook(flow.discordTemplate, discordMessage.url)
                  console.log(`  ✓ Discord message sent`)
                } else {
                  console.warn(`  ⚠️ Discord webhook or template missing`)
                }
                flowPath.splice(current, 1)
                continue
              }

              if (action === 'Slack') {
                if (flow.slackAccessToken && flow.slackChannels.length > 0 && flow.slackTemplate) {
                  const channels = flow.slackChannels.map((channel) => ({
                    label: '',
                    value: channel,
                  }))
                  
                  await postMessageToSlack(
                    flow.slackAccessToken,
                    channels,
                    flow.slackTemplate
                  )
                  console.log(`  ✓ Slack message sent to ${flow.slackChannels.length} channel(s)`)
                } else {
                  console.warn(`  ⚠️ Slack configuration incomplete`)
                }
                flowPath.splice(current, 1)
                continue
              }

              if (action === 'Notion') {
                if (flow.notionDbId && flow.notionAccessToken && flow.notionTemplate) {
                  await onCreateNewPageInDatabase(
                    flow.notionDbId,
                    flow.notionAccessToken,
                    JSON.parse(flow.notionTemplate)
                  )
                  console.log(`  ✓ Notion page created`)
                } else {
                  console.warn(`  ⚠️ Notion configuration incomplete`)
                }
                flowPath.splice(current, 1)
                continue
              }

              if (action === 'Wait') {
                console.log(`  ⏱️ Setting up cron job for delayed execution`)
                
                const res = await axios.put(
                  'https://api.cron-job.org/jobs',
                  {
                    job: {
                      url: `${process.env.NGROK_URI}?flow_id=${flow.id}`,
                      enabled: 'true',
                      schedule: {
                        timezone: 'Europe/Istanbul',
                        expiresAt: 0,
                        hours: [-1],
                        mdays: [-1],
                        minutes: ['*****'],
                        months: [-1],
                        wdays: [-1],
                      },
                    },
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${process.env.CRON_JOB_KEY!}`,
                      'Content-Type': 'application/json',
                    },
                  }
                )
                
                if (res.status === 200) {
                  flowPath.splice(current, 1)
                  await db.workflows.update({
                    where: { id: flow.id },
                    data: { cronPath: JSON.stringify(flowPath) },
                  })
                  console.log(`  ✓ Cron job created, remaining actions stored`)
                }
                break
              }

              current++
            } catch (actionError: any) {
              console.error(`  ❌ Error executing ${action}:`, actionError.message)
              // Continue to next action even if one fails
              flowPath.splice(current, 1)
            }
          }

          console.log(`✅ Workflow ${flow.name} completed`)
          return { success: true, workflowId: flow.id }
        } catch (flowError: any) {
          console.error(`❌ Error executing workflow ${flow.id}:`, flowError.message)
          return { success: false, workflowId: flow.id, error: flowError.message }
        }
      })
    )

    // Deduct 1 credit per trigger event (not per workflow)
    if (user.credits !== 'Unlimited') {
      try {
        await db.user.update({
          where: { clerkId: user.clerkId },
          data: { credits: `${parseInt(user.credits!) - 1}` },
        })
        console.log(`💳 Deducted 1 credit from user ${user.clerkId}`)
      } catch (creditError: any) {
        console.error(`❌ Error deducting credits:`, creditError.message)
      }
    }

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failCount = results.length - successCount

    console.log(`📊 Execution summary: ${successCount} succeeded, ${failCount} failed`)

    return Response.json(
      {
        message: 'Workflows executed',
        executed: results.length,
        succeeded: successCount,
        failed: failCount,
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('❌ Fatal error in notification handler:', error)
    return Response.json(
      {
        message: 'Internal server error',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
