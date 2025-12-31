import { postContentToWebHook } from '@/app/(main)/(pages)/connections/_actions/discord-connection'
import { onCreateNewPageInDatabase } from '@/app/(main)/(pages)/connections/_actions/notion-connection'
import { postMessageToSlack } from '@/app/(main)/(pages)/connections/_actions/slack-connection'
import { db } from '@/lib/db'
import axios from 'axios'
import { headers } from 'next/headers'
import { NextRequest } from 'next/server'

// In-memory cache for processed message numbers (reset on server restart)
const processedMessages = new Set<string>()

// Rate limiting: track last execution time per user (userId -> timestamp)
const lastExecutionTime = new Map<string, number>()
const COOLDOWN_PERIOD = 10000 // 10 seconds cooldown between workflow executions per user

export async function POST(req: NextRequest) {
  console.log('Google Drive notification received')
  
  try {
    const headersList = headers()
    let channelResourceId: string | undefined
    let messageNumber: string | undefined
    
    headersList.forEach((value, key) => {
      if (key === 'x-goog-resource-id') channelResourceId = value
      if (key === 'x-goog-message-number') messageNumber = value
    })
    
    // Check for duplicate message
    if (messageNumber && processedMessages.has(messageNumber)) {
      console.log(`Duplicate message ${messageNumber} - skipping`)
      return Response.json(
        { message: 'Duplicate message ignored' },
        { status: 200 }
      )
    }
    
    // Mark message as processed
    if (messageNumber) {
      processedMessages.add(messageNumber)
      // Clean up old messages (keep last 1000)
      if (processedMessages.size > 1000) {
        const iterator = processedMessages.values()
        for (let i = 0; i < 100; i++) {
          const nextValue = iterator.next().value
          if (nextValue) processedMessages.delete(nextValue)
        }
      }
    }

    if (!channelResourceId) {
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
      return Response.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Rate limiting: check if user executed workflow recently
    const now = Date.now()
    const lastExecution = lastExecutionTime.get(user.clerkId)
    
    if (lastExecution && (now - lastExecution) < COOLDOWN_PERIOD) {
      const remainingCooldown = Math.ceil((COOLDOWN_PERIOD - (now - lastExecution)) / 1000)
      console.log(`Rate limit: ${remainingCooldown}s cooldown remaining`)
      return Response.json(
        { message: `Rate limited. Please wait ${remainingCooldown} seconds.` },
        { status: 429 }
      )
    }

    // Update last execution time
    lastExecutionTime.set(user.clerkId, now)
    
    // Clean up old entries (keep last 100 users)
    if (lastExecutionTime.size > 100) {
      const entries = Array.from(lastExecutionTime.entries())
      entries.sort((a, b) => b[1] - a[1])
      lastExecutionTime.clear()
      entries.slice(0, 100).forEach(([userId, timestamp]) => {
        lastExecutionTime.set(userId, timestamp)
      })
    }

    // Check if user has credits
    const hasCredits = user.credits === 'Unlimited' || parseInt(user.credits || '0') > 0
    
    if (!hasCredits) {
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
      return Response.json(
        { message: 'No published workflows to execute' },
        { status: 200 }
      )
    }

    console.log(`Executing ${workflows.length} workflow(s)`)

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
                
                console.log(`  🔍 Checking Discord config: webhook=${!!discordMessage?.url}, template=${!!flow.discordTemplate}`)
                
                if (discordMessage?.url && flow.discordTemplate) {
                  console.log(`  📤 Sending to Discord webhook: ${discordMessage.url.substring(0, 50)}...`)
                  await postContentToWebHook(flow.discordTemplate, discordMessage.url)
                  console.log(`  ✓ Discord message sent`)
                } else {
                  console.warn(`  ⚠️ Discord configuration incomplete: webhook=${!!discordMessage?.url}, template=${!!flow.discordTemplate}`)
                }
                flowPath.splice(current, 1)
                continue
              }

              if (action === 'Slack') {
                if (flow.slackAccessToken && flow.slackChannels && flow.slackChannels.length > 0 && flow.slackTemplate) {
                  const channels = flow.slackChannels.map((channel) => ({
                    label: '',
                    value: channel,
                  }))
                  
                  await postMessageToSlack(
                    flow.slackAccessToken,
                    channels,
                    flow.slackTemplate
                  )
                  console.log(`  Slack sent to ${flow.slackChannels.length} channel(s)`)
                } else {
                  console.warn(`  Slack config incomplete`)
                }
                flowPath.splice(current, 1)
                continue
              }

              if (action === 'Notion') {
                if (flow.notionDbId && flow.notionDbId.trim() !== '' && flow.notionAccessToken && flow.notionTemplate) {
                  try {
                    await onCreateNewPageInDatabase(
                      flow.notionDbId.trim(),
                      flow.notionAccessToken,
                      JSON.parse(flow.notionTemplate)
                    )
                    console.log(`  Notion page created`)
                  } catch (notionError: any) {
                    console.error(`  Notion error: ${notionError.message}`)
                  }
                } else {
                  console.warn(`  Notion config incomplete`)
                }
                flowPath.splice(current, 1)
                continue
              }

              if (action === 'Wait') {
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
                  console.log(`  Cron job scheduled`)
                }
                break
              }

              current++
            } catch (actionError: any) {
              console.error(`  ${action} error: ${actionError.message}`)
              flowPath.splice(current, 1)
            }
          }

          return { success: true, workflowId: flow.id }
        } catch (flowError: any) {
          console.error(`Workflow ${flow.name} error: ${flowError.message}`)
          return { success: false, workflowId: flow.id, error: flowError.message }
        }
      })
    )

    // Deduct 1 credit per trigger event
    if (user.credits !== 'Unlimited') {
      try {
        await db.user.update({
          where: { clerkId: user.clerkId },
          data: { credits: `${parseInt(user.credits!) - 1}` },
        })
        console.log(`Credit deducted`)
      } catch (creditError: any) {
        console.error(`Credit deduction error: ${creditError.message}`)
      }
    }

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failCount = results.length - successCount

    console.log(`Workflows complete: ${successCount} succeeded, ${failCount} failed`)

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
    console.error('Notification handler error:', error.message)
    return Response.json(
      {
        message: 'Internal server error',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
