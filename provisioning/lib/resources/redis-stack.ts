import * as cdk from 'aws-cdk-lib';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class RedisStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    vpc: ec2.IVpc,
    props?: cdk.StackProps,
  ) {
    super(scope, id, props);

    const redisSecurityGroup = new ec2.SecurityGroup(
      this,
      'RedisSecurityGroup',
      {
        vpc,
        description: 'Security group for Redis cluster',
        allowAllOutbound: true,
      },
    );

    redisSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(6379),
      'Allow Redis traffic from within VPC',
    );

    const subnetGroup = new elasticache.CfnSubnetGroup(
      this,
      'RedisSubnetGroup',
      {
        description: 'Subnet group for Redis cluster',
        subnetIds: vpc.selectSubnets({
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        }).subnetIds,
      },
    );

    const redisCluster = new elasticache.CfnCacheCluster(this, 'RedisCluster', {
      clusterName: 'events-redis-cluster',
      engine: 'redis',
      cacheNodeType: 'cache.t3.micro',
      numCacheNodes: 1,
      cacheSubnetGroupName: subnetGroup.ref,
      vpcSecurityGroupIds: [redisSecurityGroup.securityGroupId],
    });

    new cdk.CfnOutput(this, 'RedisEndpoint', {
      value: redisCluster.attrRedisEndpointAddress,
      description: 'Redis cluster endpoint',
    });

    new cdk.CfnOutput(this, 'RedisPort', {
      value: redisCluster.attrRedisEndpointPort,
      description: 'Redis cluster port',
    });
  }
}
