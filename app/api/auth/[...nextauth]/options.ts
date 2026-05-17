import type { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getPrisma } from '../../../../lib/prisma'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const prisma = getPrisma()
        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        // Do not auto-create users during credential authorization.
        // This prevents inconsistent auth behavior across different DATABASE_URLs.


        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) {
          return null
        }

        const requireVerification = process.env.REQUIRE_EMAIL_VERIFICATION !== 'false'
        const role = (user.role ?? '').toString().trim().toUpperCase()
        const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'
        const emailVerifiedAt = user.emailVerifiedAt
        if (requireVerification && !isAdmin && !emailVerifiedAt) {
          throw new Error('Email not verified')
        }



        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }

      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
}
