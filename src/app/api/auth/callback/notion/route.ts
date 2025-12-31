import axios from 'axios'
import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/connections`)
  }

  try {
    // Encode credentials as Base64 (Notion actually DOES use Basic Auth)
    const credentials = Buffer.from(
      `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_API_SECRET}`
    ).toString('base64')

    const response = await axios.post(
      'https://api.notion.com/v1/oauth/token',
      {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.NOTION_REDIRECT_URI!,
      },
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.data.access_token) {
      const notion = new Client({
        auth: response.data.access_token,
      })

      // Get the first database from the workspace
      const databasesPages = await notion.search({
        filter: {
          value: 'database',
          property: 'object',
        },
        sort: {
          direction: 'ascending',
          timestamp: 'last_edited_time',
        },
      })

      const databaseId = databasesPages?.results?.length
        ? databasesPages.results[0].id
        : ''

      // Redirect back to connections with the data
      const redirectUrl = new URL(`${process.env.NEXT_PUBLIC_URL}/connections`)
      redirectUrl.searchParams.set('access_token', response.data.access_token)
      redirectUrl.searchParams.set('workspace_name', response.data.workspace_name || '')
      redirectUrl.searchParams.set('workspace_icon', response.data.workspace_icon || '')
      redirectUrl.searchParams.set('workspace_id', response.data.workspace_id || '')
      redirectUrl.searchParams.set('database_id', databaseId)

      return NextResponse.redirect(redirectUrl.toString())
    }
  } catch (error: any) {
    console.error('Notion OAuth error:', error.response?.data || error.message)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/connections?error=notion_auth_failed`)
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/connections`)
}
