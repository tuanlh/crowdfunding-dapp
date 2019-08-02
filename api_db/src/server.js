'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');

require('dotenv').config();
const app = express();
const port = process.env.PORT_LISTEN || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

routes(app);

app.use((req, res) => {
  res.status(404).send({url: req.originalUrl + ' not found'})
})

app.listen(port, () => {
  console.log('RESTful API server started on: ', port);
});

