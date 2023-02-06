
var serverlessSDK = require('./serverless_sdk/index.js');
serverlessSDK = new serverlessSDK({
  orgId: 'delorenj',
  applicationName: 'summaraize',
  appUid: '1GFk9p7xl9jfjC0dNX',
  orgUid: '5dS1v1Kx0tTT2mdCgG',
  deploymentUid: 'c5c12924-417a-4066-b6aa-a1b1a34ef284',
  serviceName: 'summaraize',
  shouldLogMeta: true,
  shouldCompressLogs: true,
  disableAwsSpans: false,
  disableHttpSpans: false,
  stageName: 'dev',
  serverlessPlatformStage: 'prod',
  devModeEnabled: false,
  accessKey: null,
  pluginVersion: '6.2.3',
  disableFrameworksInstrumentation: false
});

const handlerWrapperArgs = { functionName: 'summaraize-dev-onS3Upload', timeout: 6 };

try {
  const userHandler = require('./book.js');
  module.exports.handler = serverlessSDK.handler(userHandler.onUpload, handlerWrapperArgs);
} catch (error) {
  module.exports.handler = serverlessSDK.handler(() => { throw error }, handlerWrapperArgs);
}