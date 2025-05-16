import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "#@/_m.users/models/User.js";
import Profile from "#@/_m.users/models/Profile.js";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "./config.js";

export default function initGoogleStrategy() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/v1/users/google",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // email from google
          const email = profile.emails[0].value;
          const username = profile.displayName?.replace(/\s+/g, "_") || email;
          // const avatar = profile.photos?.[0]?.value;
          const avatar = profile._json.picture;

          // check user with this email
          let user = await User.findOne({ email });

          if (!user) {
            user = await User({
              email,
              username,
            });

            await user.save();

            // create a profile
            const profile = await Profile({ user: user._id, avatar });
            await profile.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  // Required for Passport but unused since we're using JWT
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) =>
    done(null, await User.findById(id))
  );
}
