import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class WebSocketStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const websocketLambda = new lambda.Function(this, 'WebSocketHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('backend/dist'),
      handler: 'main.handler',
      environment: {
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PORT: process.env.REDIS_PORT,
      },
    });

    const websocketApi = new apigateway.CfnApi(this, 'WebSocketApi', {
      name: 'WebSocketApi',
      protocolType: 'WEBSOCKET',
      routeSelectionExpression: '$request.body.action',
    });

    const connectIntegration = new apigateway.CfnIntegration(
      this,
      'ConnectIntegration',
      {
        apiId: websocketApi.ref,
        integrationType: 'AWS_PROXY',
        integrationUri: websocketLambda.functionArn,
        payloadFormatVersion: '2.0',
      },
    );

    const disconnectIntegration = new apigateway.CfnIntegration(
      this,
      'DisconnectIntegration',
      {
        apiId: websocketApi.ref,
        integrationType: 'AWS_PROXY',
        integrationUri: websocketLambda.functionArn,
        payloadFormatVersion: '2.0',
      },
    );

    const signalEndCallIntegration = new apigateway.CfnIntegration(
      this,
      'SignalEndCallIntegration',
      {
        apiId: websocketApi.ref,
        integrationType: 'AWS_PROXY',
        integrationUri: websocketLambda.functionArn,
        payloadFormatVersion: '2.0',
      },
    );

    new apigateway.CfnRoute(this, 'ConnectRoute', {
      apiId: websocketApi.ref,
      routeKey: '$connect',
      target: `integrations/${connectIntegration.ref}`,
    });

    new apigateway.CfnRoute(this, 'DisconnectRoute', {
      apiId: websocketApi.ref,
      routeKey: '$disconnect',
      target: `integrations/${disconnectIntegration.ref}`,
    });

    new apigateway.CfnRoute(this, 'SignalEndCallRoute', {
      apiId: websocketApi.ref,
      routeKey: 'signal-end-call',
      target: `integrations/${signalEndCallIntegration.ref}`,
    });

    new apigateway.CfnStage(this, 'WebSocketStage', {
      apiId: websocketApi.ref,
      stageName: 'dev',
      autoDeploy: true,
    });

    new cdk.CfnOutput(this, 'WebSocketApiEndpoint', {
      value: websocketApi.attrApiEndpoint,
    });
  }
}
