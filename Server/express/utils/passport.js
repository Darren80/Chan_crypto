const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./users');


const MongoClient = require('mongodb').MongoClient
let connectedClient;
let accountsDB;

(async () => { //Login to mongoDB
  try {
    connectedClient = await MongoClient.connect('mongodb://AdminDarren:AdminDarren\'sSecurePassword@localhost:27017/?ssl=true', {
      useNewUrlParser: true
    });
    accountsDB = connectedClient.db('accounts');
  } catch (error) {
    // console.log(error);
  }
  
})();

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

    // Users.findOne({ email })
    //     .then((user) => {
    //         if (!user || !user.validatePassword(password)) {
    //             return done(null, false, { errors: { 'password': 'is invalid' } });
    //         }

    //         return done(null, user);
    //     }).catch(done);
    
    
}));


