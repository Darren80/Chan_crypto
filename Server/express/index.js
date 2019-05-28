const config = require("./config/config");
const MongoClient = require('mongodb').MongoClient;

(async () => {
    try {
      let connectedClient = await MongoClient.connect('mongodb://AdminDarren:AdminDarren\'sSecurePassword@localhost:27017/?ssl=true', {
        useNewUrlParser: true
      });
  
      config.connectedClient = connectedClient;
      require('./express-server');
  
    } catch (error) {
      console.log(error);
      process.exit(2);
    }
  })();