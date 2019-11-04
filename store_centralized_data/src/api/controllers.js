'use strict';
const validateInput = require('./validateInput');
const db = require('./../db');

module.exports = {
    detail: (req, res) => {
        const ref = (req.params.campaignRef).trim();
        return db.get(ref, (err, result) => {
            // If that key exist in Redis store
            if (result) {
              const resultJSON = JSON.parse(result);
              return res.status(200).json(resultJSON);
            } else { // Key does not exist in Redis store
              return res.status(404).send(ref + " not found");
            }
          });
    },
    store: async (req, res) => {
        const input = await validateInput(req.body);
        if (input.isValid == true) {
            const data = {
                name: input.data.name,
                short_description: input.data.short_description,
                description: input.data.description,
                thumbnail_url: input.data.thumbnail_url
            };
            return db.set(input.data.id, JSON.stringify(data), err => {
                if (err) {
                    return res.status(200).json({
                        success: false,
                        error_msg: err
                    });
                } else {
                    return res.status(200).json({
                        success: true
                    });
                }
            });
        } else {
            return res.status(200).json({
                success: false,
                error_msg: input.error_msg
            });
        }
    }
}