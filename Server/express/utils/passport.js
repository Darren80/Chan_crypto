const passport = require('passport');
const LocalStrategy = require('passport-local');
const user = require('./users').user;

passport.use(new LocalStrategy({
    usernameField: 'user[email]',
    passwordField: 'user[password]',
}, (email, password, done) => {
    // Users.findOne({ email })
    //     .then((user) => {
    //         if (!user || !user.validatePassword(password)) {
    //             return done(null, false, { errors: { 'password': 'is invalid' } });
    //         }

    //         return done(null, user);
    //     }).catch(done);
    return done(null, 'Darren', 'user/pw is valid');
    // return done(null, false, { errors: { 'password': 'is invalid' } });
}));


