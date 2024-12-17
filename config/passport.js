// backend/src/config/passport.js
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { db } = require("./db/db");
const { users, accounts } = require("./db/schema");
const { eq } = require("drizzle-orm");
const crypto = require("crypto");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, profile.emails[0].value),
        });

        if (existingUser) {
          // Create or update account
          await db
            .insert(accounts)
            .values({
              userId: existingUser.id,
              type: "oauth",
              provider: "google",
              providerAccountId: profile.id,
              access_token: accessToken,
              refresh_token: refreshToken,
            })
            .onConflictDoUpdate({
              target: [accounts.provider, accounts.providerAccountId],
              set: {
                access_token: accessToken,
                refresh_token: refreshToken,
              },
            });

          return done(null, existingUser);
        }

        // Create new user
        const newUser = await db
          .insert(users)
          .values({
            email: profile.emails[0].value,
            name: profile.displayName,
            image: profile.photos ? profile.photos[0]?.value : null,
            role: "user",
            isApproved: "pending",
          })
          .returning();

        // Create account
        await db.insert(accounts).values({
          userId: newUser[0].id,
          type: "oauth",
          provider: "google",
          providerAccountId: profile.id,
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        done(null, newUser[0]);
      } catch (error) {
        done(error);
      }
    }
  )
);
