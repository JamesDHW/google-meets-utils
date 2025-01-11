import * as cdk from 'aws-cdk-lib';
import {
  Instance,
  InstanceType,
  InstanceClass,
  InstanceSize,
  MachineImage,
  Peer,
  Port,
  SecurityGroup,
  UserData,
  IVpc,
} from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

export class GoogleMeetsEc2Instance {
  public readonly instance: Instance;

  constructor(scope: Construct, id: string, vpc: IVpc) {
    const securityGroup = new SecurityGroup(scope, `${id}:SecurityGroup`, {
      vpc,
      description: 'Allow SSH and WebSocket',
      allowAllOutbound: true,
    });
    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(22), 'Allow SSH');
    securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(3000),
      'Allow WebSocket traffic',
    );

    const role = new Role(scope, `${id}:InstanceRole`, {
      assumedBy: new ServicePrincipal('amazonaws.com'),
    });
    role.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
    );

    this.instance = new Instance(scope, `${id}:Instance`, {
      vpc,
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
      machineImage: MachineImage.latestAmazonLinux2023(),
      securityGroup,
      role,
    });

    // User Data Script (Installs Docker and defines startup script)
    const userData = UserData.forLinux();

    userData.addCommands(
      // Update and install Docker
      'sudo yum update -y',
      'sudo yum install -y docker',
      'sudo service docker start',
      'sudo usermod -a -G docker ec2-user',

      // add public key to authorized_keys
      'echo "YOUR_PUBLIC_SSH_KEY" >> /home/ec2-user/.ssh/authorized_keys',
      'chmod 600 /home/ec2-user/.ssh/authorized_keys',
      'chown ec2-user:ec2-user /home/ec2-user/.ssh/authorized_keys',

      // Create application directory
      'mkdir -p /home/ec2-user/app',

      // Write the startup script
      'cat <<EOF > /home/ec2-user/startup.sh',
      '#!/bin/bash',
      'cd /home/ec2-user/app',
      'docker compose down || true', // Stop any existing containers
      'docker compose up -d', // Start the app
      'EOF',

      // Make the script executable
      'chmod +x /home/ec2-user/startup.sh',

      // Register the script to run on every boot using cron
      '(crontab -l 2>/dev/null; echo "@reboot /bin/bash /home/ec2-user/startup.sh") | crontab -',
    );

    this.instance.addUserData(userData.render());
  }
}
