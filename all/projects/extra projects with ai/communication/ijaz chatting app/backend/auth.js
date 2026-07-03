const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const db = require('./db');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        done(err, row);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
      // Find or create user
      db.get('SELECT * FROM users WHERE google_id = ?', [profile.id], (err, row) => {
          if (err) return cb(err);
          
          if (row) {
              // User exists
              return cb(null, row);
          } else {
              // Create new user
              const name = profile.displayName;
              const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
              const avatar = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;
              
              db.run('INSERT INTO users (google_id, name, email, avatar) VALUES (?, ?, ?, ?)', 
                  [profile.id, name, email, avatar], 
                  function(err) {
                      if (err) return cb(err);
                      
                      const newUser = {
                          id: this.lastID,
                          google_id: profile.id,
                          name: name,
                          email: email,
                          avatar: avatar
                      };
                      return cb(null, newUser);
                  }
              );
          }
      });
  }
));

// Local Strategy for Phone Number + Password
passport.use(new LocalStrategy({
    usernameField: 'phone_number',
    passwordField: 'password'
  },
  function(phone_number, password, cb) {
      db.get('SELECT * FROM users WHERE phone_number = ?', [phone_number], (err, row) => {
          if (err) { return cb(err); }
          if (!row) {
              return cb(null, false, { message: 'Incorrect phone number.' });
          }
          if (row.password !== password) {
              return cb(null, false, { message: 'Incorrect password.' });
          }
          return cb(null, row);
      });
  }
));
