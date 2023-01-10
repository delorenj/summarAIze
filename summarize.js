'use strict';
const AWS = require('aws-sdk');

module.exports.summarizeChunk = async (event) => {

  return {
    statusCode: 200,
    body: JSON.stringify({
      summary: "This was a story that focused around geebunt",
    }),
  }
};
