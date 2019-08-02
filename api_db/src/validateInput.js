const urlValidator = require('url-validator');
const axios = require('axios');
require('dotenv').config();

module.exports = async (input) => {
  // pre-process input
  await Object.keys(input).map(k => input[k] = input[k].trim()); // trim all elements in object
  if (process.env.PASS_ALL_VALIDATION == 1) {
    return {
      isValid: true,
      data: input,
      error_msg: null
    };
  }

  let error_msg = [];

  if (!hasOwnProperty.call(input, 'name') ||
    input.name === '') {
    error_msg.push('Name field is empty');
  } else {
    if (input.name.length < 30 ||
      input.name.length > 300
    ) {
      error_msg.push('Length of Name field is invalid')
    }
  }

  if (!hasOwnProperty.call(input, 'short_description') ||
    input.short_description === '') {
    error_msg.push('Short_description field is empty');
  } else {
    if (input.short_description.length < 100 ||
      input.short_description.length > 300
    ) {
      error_msg.push('Length of Short_description field is invalid');
    }
  }

  if (!hasOwnProperty.call(input, 'thumbnail_url')) {
    error_msg.push('Thumbnail URL is empty');
  } else {
    input.thumbnail_url = urlValidator(input.thumbnail_url);
    if (input.thumbnail_url === false) {
      error_msg.push('Thumbnail URL is invalid');
    }
  }

  if (!hasOwnProperty.call(input, 'description') ||
    input.description === '') {
    error_msg.push('Description field is empty');
  } else {
    if (input.description.length < 250 ||
      input.description.length > 10000
    ) {
      error_msg.push('Length of Description field is invalid');
    }
  }

  if (!hasOwnProperty.call(input, 'id') ||
    input.id === ''
  ) {
    error_msg.push('ID is empty')
  } else {
    if (input.id.length !== 64) {
      error_msg.push('ID is invalid');
    }
  }

  if (process.env.RECAPTCHA_ENABLE == 1) {
    if (!hasOwnProperty.call(input, 'captcha') ||
      input.captcha === '' ||
      input.captcha.length < 3
    ) {
      error_msg.push('Captcha is empty');
    } else {
      const recaptcha = await axios({
        method: 'post',
        url: 'https://www.google.com/recaptcha/api/siteverify',
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: input.captcha
        }
      });
      
      if (recaptcha.status !== 200) {
        error_msg.push('Coudn\'t load captcha');
      } else if (recaptcha.data.success == false) {
        error_msg.push('Captcha is wrong');
      }
    }
  }


  return error_msg.length > 0 ? {
    isValid: false,
    data: null,
    error_msg
  } : {
    isValid: true,
    data: input,
    error_msg: null
  };
}
