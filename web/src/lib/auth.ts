import { NextAuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import { createClient } from '@/lib/supabase/server'

const supabaseAdmin = createClient()

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: { scope: 'identify email guilds' },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const discordProfile = profile as {
          id: string
          username: string
          avatar: string | null
          email: string | null
          global_name: string | null
        }
        token.discordId = discordProfile.id
        token.accessToken = account.access_token

        const avatarUrl = discordProfile.avatar
          ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png?size=256`
          : null

        await supabaseAdmin
          .schema('arx_store')
          .from('platform_users')
          .upsert({
            discord_id: discordProfile.id,
            username: discordProfile.username,
            global_name: discordProfile.global_name || discordProfile.username,
            avatar_url: avatarUrl,
            email: discordProfile.email,
            access_token: account.access_token,
            refresh_token: account.refresh_token ?? null,
            token_expires_at: account.expires_at
              ? new Date(account.expires_at * 1000).toISOString()
              : null,
            last_login: new Date().toISOString(),
          }, { onConflict: 'discord_id' })
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).discordId = token.discordId
        ;(session.user as any).accessToken = token.accessToken
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
