const passport = require('passport');
const LocalStrategy = require('passport-local');
const user = require('./users').user;

class Passport {
    constructor(mongodbClient) {
        this._mongodbClient = mongodbClient
        
    }

    get mongodbClient() {
        return this._mongodbClient;
    }

    login() {
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
            done(null, false, 'user/pw invalid');
        }));
    }
}

module.exports = Passport;