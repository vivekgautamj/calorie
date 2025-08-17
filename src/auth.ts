/* eslint-disable */
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { createOrUpdateUser } from "@/lib/supabase"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user && user.email && user.name) {
        try {
          // Create or update user in Supabase
          const userData = await createOrUpdateUser({
            email: user.email,
            name: user.name,
            image: user.image || undefined,
          })
          
          // Store user ID in the user object for session
          if (userData) {
            ;(user as any).userId = userData.id
          }
          
          return true
        } catch (error) {
          console.error("Error creating/updating user in Supabase:", error)
          // Prevent sign in if database update fails
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub! // Auth.js ID
        ;(session.user as any).userId = (token as any).userId // Supabase User ID
      }
      return session
    },
    async jwt({ token, user, trigger, session }) {
      // When user signs in, store the userId from the user object
      if (user) {
        token.sub = user.id // Auth.js ID
        ;(token as any).userId = (user as any).userId // Supabase User ID
      }
      
      // Handle session updates
      if (trigger === "update" && session) {
        // Update token with session data if needed
        return { ...token, ...session }
      }
      
      return token
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/"
  },
  debug: true,
  trustHost: true,
})