const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bufIsEqual = require('../utils/bufIsEqual');

class User {
    constructor(user, accountsDB) {
        this._id = crypto.randomBytes(10).toString('hex');
        this.email = user.email;
        this.password = user.password;

        this.hash = user.hash || '';
        this.salt = user.salt || '';
        this.accountsDB = accountsDB;
    }

    setPassword(password) {
        this.salt = crypto.randomBytes(16).toString('hex');
        this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512');
        let buf = crypto.randomBytes(256).toString('base64');
        console.log(buf);
    }

    validatePassword(password) {
        let hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512');
        console.log(password, this.salt, this.hash, hash);
        return bufIsEqual(this.hash, hash);
    }

    save() {
        //Save to mongoDB
        return new Promise(async (resolve, reject) => {
            try {
                if (!this.hash || !this.salt) {
                    throw new Error('Password must first be set to save a user');
                }

                let users = this.accountsDB.collection('users');

                let result = await users.insertOne({
                    email: this.email,
                    salt: this.salt,
                    hash: this.hash,
                    validated: false
                });

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