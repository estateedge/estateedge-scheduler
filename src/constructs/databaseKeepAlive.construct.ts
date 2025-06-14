import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as events from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as iam from 'aws-cdk-lib/aws-iam'

export interface DatabaseKeepAliveConstructProps {
  scheduleExpression?: string
  lambdaMemorySize?: number
  lambdaTimeout?: cdk.Duration
  databaseEndpoint?: string
}

export class DatabaseKeepAliveConstruct extends Construct {
  public readonly lambdaFunction: lambda.Function
  public readonly eventRule: events.Rule

  constructor(
    scope: Construct,
    id: string,
    props: DatabaseKeepAliveConstructProps = {},
  ) {
    super(scope, id)

    // Create Lambda function
    this.lambdaFunction = new lambda.Function(
      this,
      'DatabaseKeepAliveFunction',
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        handler: 'handlers/database-keepalive/index.handler',
        code: lambda.Code.fromAsset('src'),
        memorySize: props.lambdaMemorySize ?? 128,
        timeout: props.lambdaTimeout ?? cdk.Duration.seconds(30),
        environment: {
          DATABASE_ENDPOINT: props.databaseEndpoint ?? '',
        },
      },
    )

    // Create EventBridge rule for periodic execution
    this.eventRule = new events.Rule(this, 'DatabaseKeepAliveRule', {
      schedule: events.Schedule.expression(
        props.scheduleExpression ?? 'rate(1 minute)',
      ),
      description: 'Keep database connection active by periodic calls',
    })

    this.eventRule.addTarget(new targets.LambdaFunction(this.lambdaFunction))

    this.lambdaFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents',
        ],
        resources: ['*'],
      }),
    )
  }
}
