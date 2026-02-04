import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export const authOptions: NextAuthOptions = {
  // Use PrismaAdapter only if DATABASE_URL is available
  ...(process.env.DATABASE_URL ? { adapter: PrismaAdapter(prisma) } : {}),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log('[Auth] Authorizing credentials for:', credentials?.email)

          if (!credentials?.email || !credentials?.password) {
            console.log('[Auth] Missing credentials')
            throw new Error('Invalid credentials')
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          })

          if (!user) {
            console.log('[Auth] User not found during lookup')
            throw new Error('User not found')
          }

          console.log('[Auth] User found:', user.id)

          // Verify password
          if (!user.passwordHash) {
            console.log('[Auth] User missing passwordHash')
            throw new Error('Please log in with the provider you signed up with (Google/GitHub)')
          }

          console.log('[Auth] passwordHash present, comparing...')
          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash)
          console.log('[Auth] Password valid:', isPasswordValid)

          if (!isPasswordValid) {
            console.log('[Auth] Invalid password')
            throw new Error('Invalid password')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            onboarded: user.onboarded,
            systemRole: user.systemRole as string,
          }
        } catch (error) {
          console.error('[Auth] Authorize error:', error)
          return null
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        // For credentials login, user object already has onboarded and systemRole
        // For OAuth login, we need to fetch from DB only on initial sign in
        if ('onboarded' in user) {
          // Credentials login - use provided values
          token.onboarded = user.onboarded
          token.systemRole = user.systemRole || 'USER'
        } else {
          // OAuth login - fetch from DB only once on sign in
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { onboarded: true, systemRole: true },
          })
          token.onboarded = dbUser?.onboarded ?? false
          token.systemRole = dbUser?.systemRole ?? 'USER'
        }
      }

      // Only refresh user data from DB when explicitly triggered (e.g., after onboarding)
      // This prevents unnecessary DB queries on every token use
      if (trigger === 'update' && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { onboarded: true, systemRole: true },
        })
        if (dbUser) {
          token.onboarded = dbUser.onboarded
          token.systemRole = dbUser.systemRole
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.onboarded = token.onboarded as boolean
        session.user.systemRole = token.systemRole as string
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
}
