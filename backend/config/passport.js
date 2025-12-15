const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { promisePool } = require('./database');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const avatarUrl = profile.photos[0]?.value;

        // Check if user exists
        const [users] = await promisePool.query(
          'SELECT * FROM users WHERE google_id = ?',
          [googleId]
        );

        if (users.length > 0) {
          // User exists, return user
          return done(null, users[0]);
        }

        // Create new user with default role 'user'
        const [result] = await promisePool.query(
          'INSERT INTO users (google_id, email, name, avatar_url, role) VALUES (?, ?, ?, ?, ?)',
          [googleId, email, name, avatarUrl, 'user']
        );

        // Fetch the newly created user
        const [newUsers] = await promisePool.query(
          'SELECT * FROM users WHERE id = ?',
          [result.insertId]
        );

        return done(null, newUsers[0]);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [users] = await promisePool.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, users[0]);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
