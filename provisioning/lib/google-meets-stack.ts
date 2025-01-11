import { Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { GoogleMeetsEc2Instance } from './resources/ec2-instance';
import { GoogleMeetsVpc } from './resources/vpc';

export const APP_SCOPE = 'GoogleMeetsChromeExtension';

export class GoogleMeetsStack extends Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpcStack = new GoogleMeetsVpc(scope, `${APP_SCOPE}-VpcStack`);

    new GoogleMeetsEc2Instance(scope, `${APP_SCOPE}-Ec2Stack`, vpcStack.vpc);
  }
}
