import { google } from 'googleapis'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/db'

export async function GET() {
  console.log('🔵 Setting up Google Drive listener...')
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.OAUTH2_REDIRECT_URI
  )

  const { userId } = await auth()
  if (!userId) {
    console.warn('⚠️ Unauthorized request - no user ID')
    return NextResponse.json({ message: 'User not found' }, { status: 401 })
  }

  try {
    // Check if listener is already active
    const existingUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { googleResourceId: true },
    })

    if (existingUser?.googleResourceId) {
      console.log(`✅ Listener already active for user ${userId}`)
      return NextResponse.json(
        { 
          message: 'Google Drive listener is already active',
          resourceId: existingUser.googleResourceId,
          alreadyActive: true,
        },
        { status: 200 }
      )
    }

    console.log(`📡 Fetching Google OAuth token for user ${userId}...`)
    const clerk = await clerkClient()
    const clerkResponse = await clerk.users.getUserOauthAccessToken(
      userId,
      'oauth_google'
    )

    if (!clerkResponse || !clerkResponse.data || clerkResponse.data.length === 0) {
      console.error('❌ No Google OAuth token found')
      return NextResponse.json(
        { message: 'No Google OAuth token found. Please connect Google Drive in your connections.' },
        { status: 400 }
      )
    }

    const accessToken = clerkResponse.data[0].token
    oauth2Client.setCredentials({
      access_token: accessToken,
    })

    const drive = google.drive({
      version: 'v3',
      auth: oauth2Client,
    })
    
    console.log('🔑 Getting start page token...')
    const startPageTokenRes = await drive.changes.getStartPageToken({})
    const startPageToken = startPageTokenRes.data.startPageToken
    
    if (!startPageToken) {
      throw new Error('Failed to get start page token from Google Drive')
    }

    const channelId = uuidv4()
    const webhookUrl = `${process.env.NGROK_URI}/api/drive-activity/notification`
    
    console.log(`📞 Creating webhook listener at: ${webhookUrl}`)
    
    const listener = await drive.changes.watch({
      pageToken: startPageToken,
      supportsAllDrives: true,
      supportsTeamDrives: true,
      requestBody: {
        id: channelId,
        type: 'web_hook',
        address: webhookUrl,
        kind: 'api#channel',
      },
    })

    if (listener.status === 200 && listener.data.resourceId) {
      console.log(`💾 Storing resource ID: ${listener.data.resourceId}`)
      
      const channelStored = await db.user.updateMany({
        where: { clerkId: userId },
        data: { googleResourceId: listener.data.resourceId },
      })

      if (channelStored.count > 0) {
        console.log(`✅ Google Drive listener activated successfully for user ${userId}`)
        return NextResponse.json(
          {
            message: 'Google Drive listener activated successfully!',
            resourceId: listener.data.resourceId,
            expiresAt: listener.data.expiration,
          },
          { status: 200 }
        )
      }
      
      throw new Error('Failed to store resource ID in database')
    }

    throw new Error('Failed to create Google Drive webhook listener')
    
  } catch (error: any) {
    console.error('❌ Google Drive Activity API error:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to set up Google Drive activity listener'
    
    if (error.code === 'ENOTFOUND' || error.message?.includes('NGROK_URI')) {
      errorMessage = 'NGROK_URI is not configured or unreachable. Please set up your webhook URL.'
    } else if (error.code === 401 || error.message?.includes('credentials')) {
      errorMessage = 'Google authentication failed. Please reconnect your Google Drive.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      {
        message: errorMessage,
        error: error.message,
        code: error.code,
      },
      { status: 500 }
    )
  }
}
