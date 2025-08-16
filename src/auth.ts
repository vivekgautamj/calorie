/* eslint-disable */
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { createOrUpdateUser } from "@/lib/supabase"

const authConfig = {
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
          
          // Store Supabase user ID in the user object for session
          if (userData) {
            ;(user as any).supabaseUserId = userData.id
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
        ;(session.user as any).supabaseUserId = (token as any).supabaseUserId // Supabase User ID
      }
      return session
    },
    async jwt({ token, user, trigger, session }) {
      // When user signs in, store the supabaseUserId from the user object
      if (user) {
        token.sub = user.id // Auth.js ID
        ;(token as any).supabaseUserId = (user as any).supabaseUserId // Supabase User ID
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
}

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig)

// Export authOptions for API routes
export const authOptions = authConfig