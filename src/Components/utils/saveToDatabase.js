// getting-started.js
const mongoose = require('mongoose');

export let db = {
    connect() {
        console.log(mongoose);
        mongoose.connect('mongodb://localhost/test');
    }
}
