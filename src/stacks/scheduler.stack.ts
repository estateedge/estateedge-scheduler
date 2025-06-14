import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { DatabaseKeepAliveConstruct } from '../constructs/databaseKeepAlive.construct'

export interface SchedulerStackProps extends cdk.StackProps {}

export class SchedulerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: SchedulerStackProps) {
    super(scope, id, props)

    new DatabaseKeepAliveConstruct(this, 'DatabaseKeepAlive', {
      scheduleExpression: 'rate(1 minute)',
      lambdaMemorySize: 128,
      lambdaTimeout: cdk.Duration.seconds(30),
    })
  }
}
