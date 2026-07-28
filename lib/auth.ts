import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/calendar.freebusy",
            "https://www.googleapis.com/auth/calendar.events",
          ].join(" "),
        },
      },
    }),
  ],
  pages: { signIn: "/" },
  events: {
    async signIn({ account }) {
      if (
        account?.provider !== "google" ||
        !account.providerAccountId ||
        !account.refresh_token
      ) {
        return;
      }

      await prisma.account.updateMany({
        where: {
          provider: "google",
          providerAccountId: account.providerAccountId,
        },
        data: {
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          scope: account.scope,
          token_type: account.token_type,
          id_token: account.id_token,
        },
      });
    },
  },
};
