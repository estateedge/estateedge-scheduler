import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as events from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as iam from 'aws-cdk-lib/aws-iam'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'

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

    new NodejsFunction(this, 'DatabaseKeepAliveFunction', {
      functionName: 'estateedge-database-keepalive',
      entry: 'src/handlers/database-keepalive/cron/database-keepalive.cron.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_22_X,
      memorySize: props.lambdaMemorySize ?? 128,
      timeout: props.lambdaTimeout ?? cdk.Duration.seconds(30),
      environment: {
        DATABASE_ENDPOINT: props.databaseEndpoint ?? '',
      },
    })

    // Create EventBridge rule for periodic execution
    this.eventRule = new events.Rule(this, 'DatabaseKeepAliveRule', {
      schedule: events.Schedule.expression(
        props.scheduleExpression ?? 'rate(1 day)',
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
