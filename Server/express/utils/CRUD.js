const connectedClient = require("../config/config").connectedClient;
let accountsDB = connectedClient.db('accounts');

async function findUser(email) {

    let account;
    let cursor = await accountsDB.collection('users').find({ email: email }).limit(1);

    if (await cursor.count() === 1) {
        await cursor.forEach((userAccount) => {
            account = userAccount;
        });
    }

    return account;
}

module.exports = findUser;