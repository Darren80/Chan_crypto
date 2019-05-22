const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const User = require('../../utils/users');

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

//POST new user route (optional, everyone has access)
router.post('/', auth.optional, async (req, res, next) => {

    const { body: { user } } = req;

    if (!user.email) {
        return res.status(422).json({
            errors: {
                email: 'is required',
            },
        });
    }

    if (!user.email.match(/^\S+@\S+$/)) {
        return res.status(422).json({
            errors: {
                email: 'is malformed',
            },
        });
    }

    if (!user.password) {
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }

    const finalUser = new User(user, accountsDB);

    finalUser.setPassword(user.password);

    try {
        await finalUser.save();
        res.json({ user: finalUser.toAuthJSON() });
    } catch (error) {
        next(error);
    }
});

//POST login route (optional, everyone has access)
router.post('/login', auth.optional, (req, res, next) => {
    const userObj = req.body.user;

    if (!userObj.email) {
        return res.status(422).json({
            errors: {
                email: 'is required',
            },
        });
    }

    if (!userObj.password) {
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }

    return passport.authenticate('local', {
        session: false
    }, (err, passportUser, info) => {
        if (err) {
            console.log('ERROR: ', err);
            return next(err);
        }

        if (passportUser) {
            let user = new User(userObj);
            user.token = user.generateJWT();
            console.log(user.token);

            return res.json({ user: user.toAuthJSON() });
        }
        return res.status(400).json(info);
    })(req, res, next);
});

//GET current route (required, only authenticated users have access)
router.get('/current', auth.required, async (req, res, next) => {
    const { payload } = req;
    console.log(payload);

    let cursor = await accountsDB.collection('users').find({ email: payload.email });
    if (await cursor.count() === 0) {
        return res.sendStatus(400);
    } else {
        await cursor.forEach((account) => {
            console.log(account);
        });
    }
    let user = new User(payload);
    return res.json({ user: user.toAuthJSON() });
});

//Error handler
router.use((err, req, res, next) => {
    console.error(err.stack);
    if (err.status === 401) {
        res.status(401).send('401 Unauthorised');
    } else {
        next(err);
    }
})

module.exports = router;