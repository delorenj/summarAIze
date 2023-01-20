#!/usr/bin/env node
const args = require('args')
const apigClientFactory = require('aws-api-gateway-client').default;

args
  .option('stage', 'The serverless stage to use', 'dev')
  .option('endpoint', 'The serverless lambda endpoint to hit', 'user')
  .option('method', 'HTTP request method', 'GET')

const flags = args.parse(process.argv)

const testEndpoint = async () => {
    const config = {invokeUrl:process.env.INVOKE_URL + '/' + flags.stage}
    const apigClient = apigClientFactory.newClient(config);
    const params = {
        restApiId: process.env.,
        resourceId: 'YOUR_RESOURCE_ID',
        httpMethod: 'GET',
        headers: {},
        pathVariables: {},
        queryParams: {}
    };

    const data = await cliTest.test(endpoint, params);
    console.log(data);
};

testEndpoint(process.argv[2]);
