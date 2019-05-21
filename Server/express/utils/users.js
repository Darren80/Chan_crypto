const crypto = require('crypto');
const jwt = require('jsonwebtoken');

let schema = {
    email: '',
    hash: '',
    salt: ''
}

class User {
    constructor(user, accountsDB) {
        this._id = crypto.randomBytes(10).toString('hex');
        this.email = user.email;
        this.password = user.password;

        this.hash = '';
        this.salt = '';
        this.accountsDB = accountsDB;
    }

    setPassword(password) {
        this.salt = crypto.randomBytes(16).toString('hex');
        this.hash = crypto.pbkdf2Sync(password, schema.salt, 10000, 512, 'sha512');
    }

    validatePassword(password) {
        let hash = crypto.pbkdf2Sync(password, schema.salt, 10000, 512, 'sha512');
        return schema.hash === hash;
    }

    save() {
        //Save to mongoDB
        return new Promise((resolve, reject) => {
            try {
                if (!this.hash || !this.salt) {
                    throw new Error('Password must first be set to save a user');
                }

                let users = this.accountsDB.collection('users');

                let result = await users.insertOne({
                    email: this.email,
                    salt: this.salt,
                    hash: this.hash
                });
                console.log(result);

                resolve({ salt: this.salt, hash: this.hash, email: this.email });
            } catch (error) {
                reject(`${error}`);
            }

        });
    }

    generateJWT() {
        const today = new Date();
        const expirationDate = new Date(today);
        expirationDate.setDate(today.getDate() + 60);

        return jwt.sign({
            email: this.email,
            id: this._id,
            exp: parseInt(expirationDate.getTime() / 1000, 10),
        }, 'secret');
    }

    toAuthJSON() {
        return {
            _id: this._id,
            email: this.email,
            token: this.generateJWT(),
        };
    }
}

module.exports = User;