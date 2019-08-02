'use strict';
module.exports = app => {
  let ctrl = require('./controllers');

  app.route('/campaign')
    .post(ctrl.store);

  app.route('/campaign/:campaignRef')
    .get(ctrl.detail);
};