import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { type NextAuthOptions } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    jwt?: string
    user: {
      id?: string | number
      firstName?: string
      lastName?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    jwt?: string
    firstName?: string
    lastName?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    jwt?: string
    id?: string | number
    firstName?: string
    lastName?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: 'Strapi',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials) return null

        const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: credentials.email,
            password: credentials.password
          })
        })

        const data = await res.json()

        if (!res.ok || !data.jwt) {
          throw new Error(data.error?.message || 'Login failed')
        }

        return {
          id: data.user.id,
          name: data.user.username,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          jwt: data.jwt
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.jwt = user.jwt
        token.id = user.id
        token.firstName = user.firstName
        token.lastName = user.lastName
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.firstName = token.firstName
      session.user.lastName = token.lastName
      session.jwt = token.jwt
      return session
    }
  },
  pages: {
    signIn: '/login'
  },
  secret: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET
}

export default NextAuth(authOptions)
