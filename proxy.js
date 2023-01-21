const awsServerlessExpress = require('@vendia/serverless-express');
const express = require('express');
const app = express();

app.use(function(req, res, next) {
  console.log("app.use()");
    console.log("req", req);
    console.log("res", res);
    next();
});

app.all('*', (req, res) => {
    console.log("app.all(): And now we forward to the proper jangler", req, res);
});

const server = awsServerlessExpress.createServer(app);
exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context);
