const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./users');

const connectedClient = require("../../../config").connectedClient;
let accountsDB = connectedClient.db('accounts');

passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]',
}, async (email, password, done) => {

  let cursor = await accountsDB.collection('users').find({ email: email }).limit(1);

  if (await cursor.count() === 0) {
    return done(null, false, { errors: { 'username': 'is invalid' } });
  }

  await cursor.forEach((account) => {
    account.hash = account.hash.buffer;
    let user = new User(account);

    if (user.validatePassword(password)) {
      return done(null, 'Darren', 'user/pw is valid');
    } else {
      return done(null, false, { errors: { 'password': 'is invalid' } });
    }
  });

  return done(null, false, { errors: { 'error': 'unknown error has occured' } });
}));


