import axios from 'axios'
import { NextResponse, NextRequest } from 'next/server'
import url from 'url'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const error = req.nextUrl.searchParams.get('error')
  const errorDescription = req.nextUrl.searchParams.get('error_description')

  // Single source of truth for redirects — resolves per environment
  // (dev: https://localhost:3001, docker: http://localhost:3001, prod: public URL).
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://localhost:3001'

  // Handle OAuth errors (user cancelled or denied)
  if (error) {
    console.log('Discord OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      `${baseUrl}/connections?error=${error}`
    )
  }

  // If no code and no error, something went wrong
  if (!code) {
    console.log('No code received from Discord')
    return NextResponse.redirect(
      `${baseUrl}/connections?error=no_code`
    )
  }

  try {
    const data = new url.URLSearchParams()
    data.append('client_id', process.env.DISCORD_CLIENT_ID!)
    data.append('client_secret', process.env.DISCORD_CLIENT_SECRET!)
    data.append('grant_type', 'authorization_code')
    data.append(
      'redirect_uri',
      `${baseUrl}/api/auth/callback/discord`
    )
    data.append('code', code.toString())

    const output = await axios.post(
      'https://discord.com/api/oauth2/token',
      data,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    if (output.data && output.data.webhook) {
      const access = output.data.access_token
      const UserGuilds: any = await axios.get(
        `https://discord.com/api/users/@me/guilds`,
        {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        }
      )

      const UserGuild = UserGuilds.data.filter(
        (guild: any) => guild.id == output.data.webhook.guild_id
      )

      return NextResponse.redirect(
        `${baseUrl}/connections?webhook_id=${output.data.webhook.id}&webhook_url=${output.data.webhook.url}&webhook_name=${output.data.webhook.name}&guild_id=${output.data.webhook.guild_id}&guild_name=${UserGuild[0]?.name || ''}&channel_id=${output.data.webhook.channel_id}`
      )
    }

    // If no webhook data, redirect back to connections
    return NextResponse.redirect(`${baseUrl}/connections`)
  } catch (error: any) {
    console.error('Discord OAuth error:', error.message)
    return NextResponse.redirect(
      `${baseUrl}/connections?error=auth_failed`
    )
  }
}
