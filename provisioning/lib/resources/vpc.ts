import * as cdk from 'aws-cdk-lib';
import {
  GatewayVpcEndpointAwsService,
  SubnetType,
  Vpc,
} from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class GoogleMeetsVpc extends Construct {
  public readonly vpc: Vpc;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.vpc = new Vpc(this, `${id}:EventsVpc`, {
      maxAzs: 1,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: 'PublicSubnet',
          subnetType: SubnetType.PUBLIC,
        },
      ],
    });

    this.vpc.addGatewayEndpoint(`${id}:S3GatewayEndpoint`, {
      service: GatewayVpcEndpointAwsService.S3,
    });

    new cdk.CfnOutput(scope, `${id}:EventsVpcId`, {
      value: this.vpc.vpcId,
      description: 'Google Meets VPC ID',
    });
  }
}
