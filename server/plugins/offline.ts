export default {
  name: 'serverless-offline',
  config: {
    'serverless-offline': {
      httpPort: '3020',
      lambdaPort: '3021',
      websocketPort: '3022',
      noPrependStageInUrl: true,
      reloadHandler: true
    }
  },
  iamRoleStatements: []
};
