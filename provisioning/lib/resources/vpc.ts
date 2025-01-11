import * as cdk from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class GoogleMeetsVpc {
  public readonly vpc: Vpc;

  constructor(scope: Construct, id: string) {
    this.vpc = new Vpc(scope, `${id}:EventsVpc`, {
      maxAzs: 1,
      natGateways: 0,
    });

    new cdk.CfnOutput(scope, `${id}:EventsVpcId`, {
      value: this.vpc.vpcId,
      description: 'Google Meets VPC ID',
    });
  }
}
