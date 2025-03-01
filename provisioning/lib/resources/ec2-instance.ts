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
  SubnetType,
  CfnKeyPair,
} from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { CfnOutput } from 'aws-cdk-lib';

export class GoogleMeetsEc2Instance extends Construct {
  public readonly instance: Instance;

  constructor(scope: Construct, id: string, vpc: IVpc) {
    super(scope, id);

    const securityGroup = new SecurityGroup(this, `${id}:SecurityGroup`, {
      vpc,
      description: 'Allow SSH and WebSocket',
      allowAllOutbound: true,
    });
    securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(443),
      'Allow HTTPS traffic',
    );
    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(22), 'Allow SSH');
    securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(3000),
      'Allow WebSocket traffic',
    );

    const role = new Role(this, `${id}:InstanceRole`, {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
    });
    role.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
    );

    this.instance = new Instance(this, `${id}:Instance`, {
      vpc,
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
      machineImage: MachineImage.latestAmazonLinux2023(),
      securityGroup,
      role,
      vpcSubnets: { subnetType: SubnetType.PUBLIC },
      associatePublicIpAddress: true,
      /*
        NOTE: // must create this before with:
        `aws ec2 create-key-pair --key-name GoogleMeetsKeyPair --query 'KeyMaterial' --output text > GoogleMeetsKeyPair.pem && chmod 400 ./GoogleMeetsKeyPair.pem`
      */
      keyName: 'GoogleMeetsKeyPair',
    });

    // User Data Script (Installs Docker and defines startup script)
    const userData = UserData.forLinux();

    userData.addCommands(
      // Update and install Docker
      'sudo yum update -y',
      'sudo yum install -y docker',
      'sudo service docker start',
      'sudo usermod -a -G docker ec2-user',

      // Install Docker compose
      'mkdir -p ~/.docker/cli-plugins/',
      'curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose',
      'chmod +x ~/.docker/cli-plugins/docker-compose',

      // SSL Certificate
      'sudo yum update -y',
      'sudo yum install -y certbot',
      `sudo certbot certonly --standalone --agree-tos --email ${process.env.SSL_CERT_EMAIL} -d ${process.env.SSL_CERT_DOMAIN}`,
      // renew cert and restart every day
      '(crontab -l 2>/dev/null; echo "0 0 * * * certbot renew --quiet && sudo docker compose restart app") | crontab -',

      // add public key to authorized_keys
      `echo ${process.env.PUBLIC_SSH_KEY} >> /home/ec2-user/.ssh/authorized_keys`,
      'chmod 600 /home/ec2-user/.ssh/authorized_keys',
      'chown ec2-user:ec2-user /home/ec2-user/.ssh/authorized_keys',

      // Write the startup script
      'cat <<EOF > /home/ec2-user/startup.sh',
      '#!/bin/bash',
      'cd /home/ec2-user/backend',
      'docker compose down || true', // Stop any existing containers
      'docker compose up -d', // Start the app
      'EOF',

      // Make the script executable
      'chmod +x /home/ec2-user/startup.sh',

      // Register the script to run on every boot using cron
      '(crontab -l 2>/dev/null; echo "@reboot /bin/bash /home/ec2-user/startup.sh") | crontab -',
    );

    this.instance.addUserData(userData.render());

    new CfnOutput(this, `${id}:InstancePublicIp`, {
      value: this.instance.instancePublicIp,
      description: 'Public IP of the EC2 Instance',
    });

    new CfnOutput(this, `${id}:SSHCommand`, {
      value: `ssh -i ./GoogleMeetsKeyPair.pem ec2-user@${this.instance.instancePublicIp}`,
      description: 'SSH command to connect to EC2 instance',
    });
  }
}
