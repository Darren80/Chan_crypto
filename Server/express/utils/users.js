const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const bufIsEqual = require('../utils/bufIsEqual');
const jwtSecret = require('../../jwtSecret');

class User {
    constructor(user, accountsDB) {

        this.email = user.email;
        this.password = user.password;

        this.hash = user.hash || '';
        this.salt = user.salt || '';
        this.accountsDB = accountsDB;
    }

    setPassword(password) {
        if (!password) {
            throw new Error('Password must first be set to create a hash');
        }
        this.salt = crypto.randomBytes(16).toString('hex');
        this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512');
    }

    validatePassword(password) {
        let hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512');
        return bufIsEqual(this.hash, hash);
    }

    save() {

        // this.setPassword(this.password);

        //Save to mongoDB
        return new Promise(async (resolve, reject) => {

            if (!this.hash || !this.salt || !this.email) {
                reject('Necessay values are missing.');
            }

            try {
                let users = this.accountsDB.collection('users');
                //Make and save a new user to the database
                await users.insertOne({
                    email: this.email,
                    salt: this.salt,
                    hash: this.hash,
                    validated: false,
                    permissions: {

                    }
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
            exp: parseInt(expirationDate.getTime() / 1000, 10),
        }, jwtSecret);
    }

    toAuthJSON() {
        return {
            email: this.email,
            token: this.generateJWT(),
        };
    }
}

module.exports = User;