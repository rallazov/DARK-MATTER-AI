const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: GithubStrategy } = require('passport-github2');
const { env } = require('./env');
const { User } = require('../models/User');

async function upsertOAuthUser(profile, provider, done) {
  try {
    const email = profile.emails?.[0]?.value?.toLowerCase();
    if (!email) return done(new Error('No email found from OAuth provider'));

    const providerKey = provider === 'google' ? 'oauthProviders.googleId' : 'oauthProviders.githubId';
    const query = { $or: [{ email }, { [providerKey]: profile.id }] };
    const update = {
      $set: {
        email,
        displayName: profile.displayName || profile.username || email,
        [providerKey]: profile.id,
        avatarUrl: profile.photos?.[0]?.value
      },
      $setOnInsert: {
        role: email === env.founderEmail ? 'admin' : 'user',
        plan: 'free'
      }
    };

    const user = await User.findOneAndUpdate(query, update, {
      upsert: true,
      new: true,
      runValidators: true
    });

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}

function configurePassport() {
  if (env.googleClientId && env.googleClientSecret && env.googleCallbackUrl) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.googleClientId,
          clientSecret: env.googleClientSecret,
          callbackURL: env.googleCallbackUrl
        },
        (accessToken, refreshToken, profile, done) => upsertOAuthUser(profile, 'google', done)
      )
    );
  }

  if (env.githubClientId && env.githubClientSecret && env.githubCallbackUrl) {
    passport.use(
      new GithubStrategy(
        {
          clientID: env.githubClientId,
          clientSecret: env.githubClientSecret,
          callbackURL: env.githubCallbackUrl,
          scope: ['user:email']
        },
        (accessToken, refreshToken, profile, done) => upsertOAuthUser(profile, 'github', done)
      )
    );
  }
}

module.exports = { passport, configurePassport };
