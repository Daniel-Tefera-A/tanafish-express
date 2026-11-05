import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * Google OAuth via NextAuth. The `role` claim is null until onboarding completes;
 * the client then routes first-time users to /onboarding.
 *
 * To persist users in Supabase, upsert into `users` inside the `signIn` callback
 * using the service-role client, and read `role` back in `jwt`.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, trigger, session }) {
      if (trigger === "update" && session?.role) token.role = session.role;
      return token;
    },
    async session({ session, token }) {
      (session.user as any).role = (token as any).role ?? null;
      return session;
    },
  },
  pages: { signIn: "/" },
};
