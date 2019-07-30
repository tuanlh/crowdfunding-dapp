const urlValidator = require('url-validator');
require('dotenv').config();

module.exports = (input) => {
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
    if (urlValidator(input.thumbnail_url) === false) {
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

  if ( process.env.RECAPTCHA_ENABLE == 1 && (
    !hasOwnProperty.call(input, 'captcha') ||
    input.captcha === '' ||
    input.captcha.length < 3
  )) {
    error_msg.push('Captcha is invalid');
  }

  return error_msg;
}
