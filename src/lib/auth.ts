import { NextAuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import { createAdminClient } from '@/lib/supabase/server'

function getAdminClient() {
  return createAdminClient()
}

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
        const dp = profile as {
          id: string
          username: string
          avatar: string | null
          email: string | null
          global_name: string | null
        }
        token.discordId = dp.id
        token.email = dp.email
        token.accessToken = account.access_token

        const avatarUrl = dp.avatar
          ? `https://cdn.discordapp.com/avatars/${dp.id}/${dp.avatar}.png?size=256`
          : null

        await getAdminClient()
          .schema('store')
          .from('users')
          .upsert({
            open_id: `discord_${dp.id}`,
            discord_id: dp.id,
            email: dp.email,
            name: dp.global_name || dp.username,
            avatar_url: avatarUrl,
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
