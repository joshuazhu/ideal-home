import type { AWS } from '@serverless/typescript';
import { attachPlugins } from './plugins';

import server from '@functions/server';

const serverlessConfiguration: AWS = {
  service: 'server',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'ap-southeast-2',
    architecture: 'x86_64',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },
  // import the function via paths
  functions: { server },
  package: { individually: true }
};

module.exports = attachPlugins(serverlessConfiguration);
