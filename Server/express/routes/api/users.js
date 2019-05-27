const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const User = require('../../utils/users');

const connectedClient = require("../../../config").connectedClient;
let accountsDB = connectedClient.db('accounts');

//POST new user route (optional, everyone has access)
router.post('/', auth.optional, async (req, res, next) => {

    const loginCredentials = req.body.user;

    if (!loginCredentials.email) {
        return res.status(422).json({
            errors: {
                email: 'is required',
            },
        });
    }

    if (!loginCredentials.email.match(/^\S+@\S+$/)) {
        return res.status(422).json({
            errors: {
                email: 'is malformed',
            },
        });
    }

    if (!loginCredentials.password) {
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }

    const newUser = new User(loginCredentials, accountsDB);
    newUser.setPassword(loginCredentials.password);

    try {
        await newUser.save();
        res.json({ user: newUser.toAuthJSON() });
    } catch (error) {
        next(error);
    }

});

//POST login route (optional, everyone has access)
router.post('/login', auth.optional, (req, res, next) => {
    const loginCredentials = req.body.user;

    if (!loginCredentials.email) {
        return res.status(422).json({
            errors: {
                email: 'is required',
            },
        });
    }

    if (!loginCredentials.password) {
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
            return next(err);
        }

        if (passportUser) {
            let user = new User(loginCredentials);
            return res.json({ user: user.toAuthJSON(), info: info });
        } else {
            return res.status(400).json(info);
        }
    })(req, res, next);
});

//GET current route (required, only authenticated users have access)
router.get('/current', auth.required, async (req, res, next) => {
    const { payload } = req;
    let user = new User(payload);

    let cursor = await accountsDB.collection('users').find({ email: payload.email });
    if (await cursor.count() === 0) {
        return res.status(400).send('Account does not exist');
    } else {
        await cursor.forEach((account) => {
            if (!account.validated) {
                res.json({ user: user.toAuthJSON(), message: 'Great, you are logged in, don\'t forget to email verify your account.' });
            } else {
                res.json({ user: user.toAuthJSON(), message: 'Great, you are logged in.' });
            }
        });
    }
    return res.status(400);
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