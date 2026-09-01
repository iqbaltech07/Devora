import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { oAuthProxy } from "better-auth/plugins";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: {
    allowedHosts: [
      "localhost:3000",
      "*.vercel.app",
    ],
  },
  trustedOrigins: [
    "http://localhost:3000",
    "https://*.vercel.app",
    process.env.NEXT_PUBLIC_APP_URL || "",
    process.env.BETTER_AUTH_URL || "",
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.NEXT_PUBLIC_VERCEL_URL ? [`https://${process.env.NEXT_PUBLIC_VERCEL_URL}`] : []),
  ].filter(Boolean),
  plugins: [
    ...(process.env.BETTER_AUTH_PRODUCTION_URL || (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.startsWith("https://"))
      ? [
          oAuthProxy({
            productionURL:
              process.env.BETTER_AUTH_PRODUCTION_URL ||
              process.env.NEXT_PUBLIC_APP_URL ||
              "https://devora-find.vercel.app",
            secret: process.env.BETTER_AUTH_SECRET,
          }),
        ]
      : []),
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
});
