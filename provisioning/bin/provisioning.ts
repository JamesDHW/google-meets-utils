#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/resources/vpc-stack';
import { RedisStack } from '../lib/resources/redis-stack';
import { config as initializeDotenv } from 'dotenv';

initializeDotenv();

const app = new cdk.App();

const vpcStack = new VpcStack(app, 'VpcStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

new RedisStack(app, 'RedisStack', vpcStack.vpc, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
