#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { SchedulerStack } from './stacks/scheduler.stack'
import { getConfig } from './helpers/getConfig'

const config = getConfig()

const app = new cdk.App()
new SchedulerStack(app, 'EstateEdgeSchedulerStack', {
  env: {
    account: config.awsAccountId,
    region: config.awsRegion,
  },
})
