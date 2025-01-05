#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProvisioningStack } from '../lib/provisioning-stack';
import { initializeDotenv } from '../env';

initializeDotenv();

const app = new cdk.App();

new ProvisioningStack(app, 'GoogleMeetsUtilsStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
