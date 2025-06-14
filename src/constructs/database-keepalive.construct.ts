import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs'
import * as cdk from 'aws-cdk-lib'
import * as events from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as iam from 'aws-cdk-lib/aws-iam'

export interface DatabaseKeepAliveConstructProps {}

export class DatabaseKeepAliveConstruct extends Construct {
  public readonly lambdaFunction: NodejsFunction
  public readonly eventRule: events.Rule

  constructor(
    scope: Construct,
    id: string,
    props: DatabaseKeepAliveConstructProps = {},
  ) {
    super(scope, id)

    this.lambdaFunction = new NodejsFunction(
      this,
      'DatabaseKeepAliveFunction',
      {
        functionName: 'estateedge-database-keepalive',
        runtime: Runtime.NODEJS_22_X,
        entry:
          'src/handlers/database-keepalive/cron/database-keepalive.cron.ts',
        handler: 'handler',
        memorySize: 128,
        timeout: cdk.Duration.seconds(30),
        environment: {},
      },
    )

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

    this.eventRule = new events.Rule(this, 'DatabaseKeepAliveRule', {
      schedule: events.Schedule.expression('rate(3 days)'),
      description: 'Keep database connection active by periodic calls',
    })

    this.eventRule.addTarget(new targets.LambdaFunction(this.lambdaFunction))
  }
}
