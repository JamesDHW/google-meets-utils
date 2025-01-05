import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { WebSocketStack } from './resources/websocket-stack';
import { VpcStack } from './resources/vpc-stack';
import { RedisStack } from './resources/redis-stack';

export class ProvisioningStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const AWS_ENV = {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    };

    const vpcStack = new VpcStack(this, 'VpcStack', { env: AWS_ENV });

    new RedisStack(this, 'RedisStack', vpcStack.vpc, { env: AWS_ENV });

    new WebSocketStack(this, 'WebSocketStack', { env: AWS_ENV });
  }
}
