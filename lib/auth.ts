import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Frontend-only dummy credentials
const DUMMY_CREDENTIALS = [
  {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  },
  {
    email: 'demo@docxtract.com',
    password: 'demo123456',
    name: 'Demo Account'
  }
]

export const authOptions: NextAuthOptions = {
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

        // Validate against dummy credentials only - NO BACKEND INTEGRATION
        const user = DUMMY_CREDENTIALS.find(
          cred => cred.email === credentials.email && cred.password === credentials.password
        )

        if (user) {
          return {
            id: user.email,
            email: user.email,
            name: user.name,
            accessToken: 'frontend-demo-token-' + Date.now(),
          }
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Store the access token in the JWT on login
      if (user) {
        token.accessToken = (user as any).accessToken
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
