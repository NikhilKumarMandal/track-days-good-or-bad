import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance
import { schema } from "@/db/schema/auth-schema";


export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    basePath: "/api/auth",
    trustedOrigins: [
        "http://localhost:3000",
    ],
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),

    user: {
        additionalFields: {
            credits: {
                type: "number",
                defaultValue: 0,
                input: false,
            },
        },
    },

    socialProviders: {
        google: {
            accessType: "offline",
            prompt: "select_account consent",
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env
                .GOOGLE_CLIENT_SECRET as string,
        },
    },

});