const { app, owaspApp } = require("./express-server");

const compression = require('compression');
const bodyParser = require("body-parser");


app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());