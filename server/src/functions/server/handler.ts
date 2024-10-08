import serverlessExpress from '@vendia/serverless-express';
import middy from '@middy/core';
import { createApp } from './app';

let app;

app = createApp();

const handler = serverlessExpress({ app });

export const main = middy(handler)
