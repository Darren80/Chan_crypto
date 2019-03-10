const MongoClient = require('mongodb').MongoClient

MongoClient.connect('mongodb://localhost:27017/', (err, client) => {
    if (!err) {
        console.log("Connected to Database.");
    }
    let db = client.db('admin');

    const cursor =  db.collection('inventory').find({ status: 'D' });
    console.log(cursor);
    
});

