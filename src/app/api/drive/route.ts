import { google } from 'googleapis'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/db'

export async function GET() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.OAUTH2_REDIRECT_URI
  )

  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ message: 'User not found' }, { status: 401 })
  }

  try {
    const clerk = await clerkClient()
    const clerkResponse = await clerk.users.getUserOauthAccessToken(
      userId,
      'oauth_google'
    )

    if (!clerkResponse || !clerkResponse.data || clerkResponse.data.length === 0) {
      return NextResponse.json(
        { message: 'No Google OAuth token found. Please connect Google Drive first.' },
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
    
    const response = await drive.files.list()

    if (response) {
      return NextResponse.json(
        {
          message: response.data,
        },
        {
          status: 200,
        }
      )
    } else {
      return NextResponse.json(
        {
          message: 'No files found',
        },
        {
          status: 200,
        }
      )
    }
  } catch (error: any) {
    console.error('Google Drive API error:', error)
    return NextResponse.json(
      {
        message: 'Failed to fetch Google Drive files',
        error: error.message,
      },
      {
        status: 500,
      }
    )
  }
}
