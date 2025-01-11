#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { config as initializeDotenv } from 'dotenv';
import { APP_SCOPE, GoogleMeetsStack } from '../lib/google-meets-stack';

initializeDotenv();

const stackProps = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
};

new GoogleMeetsStack(new App(), `${APP_SCOPE}-Stack`, stackProps);
