// Import the installed modules.
const express = require('express');
const redis = require('redis');
const bodyParser = require('body-parser');
const axios = require('axios');
const urlValidator = require('url-validator');
const validateInput = require('./validateInput');
require('dotenv').config();
const app = express();
const port = process.env.PORT_LISTEN || 8080;
// create and connect redis client to local instance.
const db = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

// Print redis errors to the console
db.on('error', (err) => {
  console.log("Error " + err);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
// create an api/search route
app.get('/api/get/:id', (req, res) => {
  // Extract the query from url and trim trailing spaces
  const id = (req.params.id).trim();

  // Try fetching the result from Redis first in case we have it cached
  return db.get(id, (err, result) => {
    // If that key exist in Redis store
    if (result) {
      const resultJSON = JSON.parse(result);
      return res.status(200).json(resultJSON);
    } else { // Key does not exist in Redis store
      return res.status(404).send("Not Found");
    }
  });
});

app.post('/api/set', async (req, res) => {
  const input = req.body;
  const error_input_msg = process.env.TESTING_ENV == 0 ? [] : validateInput(input);
  if (error_input_msg.length == 0) {
    const name = (input.name).trim();
    const description = (input.description).trim();
    const short_description = (input.short_description).trim();
    const thumbnail_url = urlValidator((input.thumbnail_url).trim());
    const captcha = (input.captcha).trim();
    const content = { name, short_description, description, thumbnail_url };
    const id = (input.id).trim();
    let captchaPassed = true; //default

    if (process.env.RECAPTCHA_ENABLE == 1) {
      const recaptcha = await axios({
        method: 'post',
        url: 'https://www.google.com/recaptcha/api/siteverify',
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captcha,
          remoteip: req.connection.remoteAddress
        }
      });
      
      if (recaptcha.status !== 200) {
        captchaPassed = false;
      } else if (recaptcha.data.success == false) {
        captchaPassed = false;
      }
    }

    if (captchaPassed) {
      return db.set(id, JSON.stringify(content), (err) => {
        if (err) {
          const data = {
            success: false,
            error_msg: err
          };
          return res.status(200).json(data);
        } else {
          const data = {
            success: true
          };
          return res.status(200).json(data);
        }
      });
    } else {
      const data = {
        success: false,
        error_msg: ['invalid captcha']
      };
      return res.status(200).json(data);
    }
  }
});

app.listen(port, () => {
  console.log('Server listening on port: ', port);
});

