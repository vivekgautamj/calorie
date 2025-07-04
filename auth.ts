import NextAuth from "next-auth"
import Twitter from "next-auth/providers/twitter"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    }),
  ],
  debug: true,
  trustHost: true,
})